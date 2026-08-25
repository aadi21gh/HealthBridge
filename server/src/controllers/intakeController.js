import IntakeSession from '../models/IntakeSession.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Practitioner from '../models/Practitioner.js';
import Encounter from '../models/Encounter.js';
import Notification from '../models/Notification.js';
import Consent from '../models/Consent.js';
import AyushAssessment from '../models/AyushAssessment.js';
import ClinicalFact from '../models/ClinicalFact.js';
import AuditEvent from '../models/AuditEvent.js';

import ConversationEngine from '../intake/conversationEngine.js';
import ClinicalStructurer from '../intake/clinicalStructurer.js';
import redFlagEngine from '../intake/redFlagEngine.js';
import documentProcessor from '../intake/documentProcessor.js';
import voiceService from '../intake/voiceService.js';
import { getAyushModule, getAllDisciplineMetadata } from '../intake/ayushModules/index.js';
import { getTranslation, getSupportedLanguages } from '../intake/translations/index.js';
import MockAIProvider from '../ai/providers/MockAIProvider.js';

import { createError, sendSuccess } from '../utils/errors.js';
import logger from '../config/logger.js';

const aiProvider = new MockAIProvider();
const clinicalStructurer = new ClinicalStructurer();

// ── 1. Search Patient for Kiosk Identification ────────────────────────────────
export const searchPatientForKiosk = async (req, res, next) => {
  try {
    const { phone, abhaId, name, dob } = req.body;

    let query = {};
    if (phone) {
      const users = await User.find({ phone: new RegExp(phone.trim(), 'i') }).select('_id');
      const userIds = users.map((u) => u._id);
      query.userId = { $in: userIds };
    } else if (abhaId) {
      query.abhaId = abhaId.trim();
    } else if (name) {
      const nameParts = name.trim().split(/\s+/);
      const userQuery = {
        $or: [
          { firstName: new RegExp(nameParts[0], 'i') },
          { lastName: new RegExp(nameParts[nameParts.length - 1] || '', 'i') },
        ],
      };
      const users = await User.find(userQuery).select('_id');
      const userIds = users.map((u) => u._id);
      query.userId = { $in: userIds };
    }

    if (Object.keys(query).length === 0) {
      return next(createError(400, 'Please provide phone number, ABHA ID, or name'));
    }

    const patients = await Patient.find(query)
      .populate('userId', 'firstName lastName phone email')
      .limit(5)
      .lean();

    const sanitized = patients.map((p) => ({
      _id: p._id,
      abhaId: p.abhaId,
      gender: p.gender,
      bloodGroup: p.bloodGroup,
      dateOfBirth: p.dateOfBirth,
      firstName: p.userId?.firstName,
      lastName: p.userId?.lastName,
      phoneMasked: p.userId?.phone ? p.userId.phone.replace(/.(?=.{4})/g, '*') : null,
    }));

    return sendSuccess(res, { patients: sanitized });
  } catch (err) {
    next(err);
  }
};

// ── 2. Start Kiosk Intake Session ─────────────────────────────────────────────
export const startSession = async (req, res, next) => {
  try {
    const {
      patientId,
      organizationId,
      kioskId,
      practitionerId,
      language = 'en',
      discipline = 'MODERN_MEDICINE',
      identificationMethod = 'phone',
      consentGiven = true,
    } = req.body;

    // Find fallback org if not provided
    let targetOrgId = organizationId || req.user?.organizationId;
    if (!targetOrgId) {
      const firstOrg = await Organization.findOne();
      targetOrgId = firstOrg?._id;
    }

    // Verify or find patient
    let targetPatient = null;
    if (patientId) {
      targetPatient = await Patient.findById(patientId).populate('userId');
    }

    // Create session
    const session = await IntakeSession.create({
      patientId: targetPatient?._id || null,
      organizationId: targetOrgId,
      kioskId: kioskId || req.user?.kioskId || null,
      practitionerId: practitionerId || null,
      language,
      discipline,
      identificationMethod,
      consentGiven,
      consentTimestamp: consentGiven ? new Date() : null,
      consentLanguage: language,
      status: 'IN_PROGRESS',
      startedAt: new Date(),
      lastActivityAt: new Date(),
    });

    // Record Kiosk Consent event if consent given
    if (consentGiven && targetPatient) {
      await AuditEvent.create({
        action: 'KIOSK_CONSENT',
        actorId: targetPatient.userId?._id || targetPatient._id,
        actorRole: 'PATIENT',
        patientId: targetPatient._id,
        organizationId: targetOrgId,
        resourceType: 'IntakeSession',
        resourceId: session._id,
        purpose: 'KIOSK_INTAKE',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    // Initialize ConversationEngine and get the very first question
    const engine = new ConversationEngine(language, {
      gender: targetPatient?.gender,
    });
    const firstQuestion = engine.getNextQuestion([]);
    const progress = engine.getProgress([]);

    await AuditEvent.create({
      action: 'KIOSK_SESSION_START',
      actorId: targetPatient?.userId?._id || session._id,
      actorRole: 'PATIENT',
      patientId: targetPatient?._id,
      organizationId: targetOrgId,
      resourceType: 'IntakeSession',
      resourceId: session._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendSuccess(res, {
      session,
      currentQuestion: firstQuestion,
      progress,
    }, 201);
  } catch (err) {
    next(err);
  }
};

// ── 3. Get Session Details & Next Question ────────────────────────────────────
export const getSession = async (req, res, next) => {
  try {
    const session = await IntakeSession.findById(req.params.id)
      .populate('patientId')
      .populate('documentIds');

    if (!session) return next(createError(404, 'Intake session not found'));

    const engine = new ConversationEngine(session.language, {
      gender: session.patientId?.gender,
    });

    const nextQuestion = engine.getNextQuestion(session.answers);
    const progress = engine.getProgress(session.answers);

    return sendSuccess(res, {
      session,
      nextQuestion,
      progress,
    });
  } catch (err) {
    next(err);
  }
};

// ── 4. Submit Answer to Current Question ──────────────────────────────────────
export const submitAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionId, rawInput, inputMethod = 'text' } = req.body;

    const session = await IntakeSession.findById(id).populate('patientId');
    if (!session) return next(createError(404, 'Intake session not found'));

    if (session.status === 'COMPLETED' || session.status === 'ABANDONED') {
      return next(createError(400, `Cannot answer in a ${session.status} session`));
    }

    const engine = new ConversationEngine(session.language, {
      gender: session.patientId?.gender,
    });

    // Process answer with structured interpretation
    const processedAnswer = engine.processAnswer(questionId, rawInput, inputMethod);
    if (!processedAnswer) {
      return next(createError(400, 'Invalid question or answer format'));
    }

    // Remove any previous answer for this question (supports back & change)
    session.answers = session.answers.filter((a) => a.questionId !== questionId);
    session.answers.push(processedAnswer);
    session.lastActivityAt = new Date();

    // Deterministic Safety Screening: Run Red-Flag Engine
    const triggeredFlags = await redFlagEngine.evaluate(session.answers, {
      patientId: session.patientId?._id,
      intakeSessionId: session._id,
      organizationId: session.organizationId,
      language: session.language,
      user: req.user,
    });

    session.redFlags = triggeredFlags;
    await session.save();

    // Check next question
    const nextQuestion = engine.getNextQuestion(session.answers);
    const progress = engine.getProgress(session.answers);

    // AI Follow-Up suggestion (if applicable)
    let aiFollowUp = null;
    if (questionId === 'chief_complaint') {
      aiFollowUp = await aiProvider.generateFollowUpQuestion(session.answers, session.language);
    }

    return sendSuccess(res, {
      processedAnswer,
      nextQuestion,
      progress,
      redFlags: session.redFlags,
      aiFollowUp,
      isFinished: nextQuestion === null,
    });
  } catch (err) {
    next(err);
  }
};

// ── 5. Upload Physical Document in Kiosk Session ──────────────────────────────
export const uploadSessionDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.file) return next(createError(400, 'File buffer is required'));

    const session = await IntakeSession.findById(id);
    if (!session) return next(createError(404, 'Intake session not found'));

    const { documentType } = req.body;

    const result = await documentProcessor.processKioskDocument({
      fileBuffer: req.file.buffer,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      patientId: session.patientId,
      intakeSessionId: session._id,
      organizationId: session.organizationId,
      uploadedBy: req.user?.userId || session.patientId || session._id,
      documentTypeHint: documentType,
    });

    // Link document to session
    session.documentIds.push(result.document._id);
    session.lastActivityAt = new Date();
    await session.save();

    await AuditEvent.create({
      action: 'KIOSK_DOCUMENT_UPLOAD',
      actorId: req.user?.userId || session.patientId || session._id,
      actorRole: req.user?.role || 'PATIENT',
      patientId: session.patientId,
      organizationId: session.organizationId,
      resourceType: 'Document',
      resourceId: result.document._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendSuccess(res, {
      document: result.document,
      classification: result.classification,
      extractedFacts: result.extractedFacts,
    }, 201);
  } catch (err) {
    next(err);
  }
};

// ── 6. Complete Kiosk Session ─────────────────────────────────────────────────
export const completeSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await IntakeSession.findById(id).populate('patientId');
    if (!session) return next(createError(404, 'Intake session not found'));

    // Structure collected clinical data
    const structured = clinicalStructurer.buildStructuredData(session.answers);
    session.structuredData = structured;

    // Create preliminary ClinicalFacts from answers
    const facts = clinicalStructurer.structureFromAnswers(
      session.answers,
      session._id,
      session.patientId?._id
    );

    if (facts.length > 0) {
      await ClinicalFact.insertMany(facts);
    }

    // Generate Pre-Consultation Summary with AI
    const aiSummary = await aiProvider.generateIntakeSummary({
      ...structured,
      redFlags: session.redFlags,
    }, session.language);
    session.summary = aiSummary.summary;

    // Create Kiosk Encounter in existing longitudinal record model
    const encounter = await Encounter.create({
      patientId: session.patientId?._id || null,
      organizationId: session.organizationId,
      practitionerId: session.practitionerId || null,
      type: 'KIOSK_INTAKE',
      status: 'finished',
      startDate: session.startedAt || new Date(),
      endDate: new Date(),
      chiefComplaint: structured.chiefComplaint || 'Kiosk clinical intake',
      notes: session.summary,
    });

    session.encounterId = encounter._id;
    session.status = 'COMPLETED';
    session.completedAt = new Date();
    await session.save();

    // Alert doctor if assigned or practitioner available
    if (session.practitionerId) {
      const practitioner = await Practitioner.findById(session.practitionerId);
      if (practitioner) {
        await Notification.create({
          userId: practitioner.userId,
          type: session.redFlags?.length > 0 ? 'INTAKE_RED_FLAG' : 'INTAKE_READY',
          title: session.redFlags?.length > 0 ? '🚨 Urgent Kiosk Intake Waiting' : 'New Kiosk Intake Briefing Ready',
          message: `Intake briefing completed for ${session.patientId?.userId?.firstName || 'Patient'}. Chief complaint: ${structured.chiefComplaint || 'N/A'}`,
          relatedResourceType: 'IntakeSession',
          relatedResourceId: session._id,
        });
      }
    }

    await AuditEvent.create({
      action: 'KIOSK_SESSION_COMPLETE',
      actorId: session.patientId?.userId?._id || session._id,
      actorRole: 'PATIENT',
      patientId: session.patientId?._id,
      organizationId: session.organizationId,
      resourceType: 'IntakeSession',
      resourceId: session._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendSuccess(res, {
      session,
      encounterId: encounter._id,
      summary: session.summary,
      message: 'Intake session completed successfully. All data saved to patient record.',
    });
  } catch (err) {
    next(err);
  }
};

// ── 7. Abandon Session ────────────────────────────────────────────────────────
export const abandonSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const session = await IntakeSession.findByIdAndUpdate(
      id,
      {
        status: 'ABANDONED',
        abandonedAt: new Date(),
      },
      { new: true }
    );

    if (!session) return next(createError(404, 'Intake session not found'));

    await AuditEvent.create({
      action: 'KIOSK_SESSION_ABANDON',
      actorId: session.patientId || session._id,
      actorRole: 'PATIENT',
      patientId: session.patientId,
      organizationId: session.organizationId,
      resourceType: 'IntakeSession',
      resourceId: session._id,
      metadata: { reason: reason || 'User abandoned kiosk' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendSuccess(res, { message: 'Session abandoned', session });
  } catch (err) {
    next(err);
  }
};

// ── 8. Multilingual Questions & Translations API ──────────────────────────────
export const getQuestions = async (req, res, next) => {
  try {
    const language = req.params.language || req.query.language || 'en';
    const engine = new ConversationEngine(language);
    const applicable = engine.getAllApplicableQuestions([]);

    return sendSuccess(res, {
      language,
      questions: applicable,
      languages: getSupportedLanguages(),
      translations: getTranslation(language),
    });
  } catch (err) {
    next(err);
  }
};

// ── 9. AYUSH Discipline Config & Assessment ───────────────────────────────────
export const getAyushDiscipline = async (req, res, next) => {
  try {
    const { discipline } = req.params;
    const module = getAyushModule(discipline.toUpperCase());
    if (!module) {
      return next(createError(404, `AYUSH discipline '${discipline}' not found`));
    }
    return sendSuccess(res, { module });
  } catch (err) {
    next(err);
  }
};

export const submitAyushAssessment = async (req, res, next) => {
  try {
    const { discipline } = req.params;
    const { intakeSessionId, patientId, assessments, notes } = req.body;

    const assessment = await AyushAssessment.create({
      patientId,
      intakeSessionId,
      discipline: discipline.toUpperCase(),
      assessments: assessments || [],
      source: 'PATIENT_REPORTED',
      notes,
    });

    return sendSuccess(res, { assessment }, 201);
  } catch (err) {
    next(err);
  }
};

// ── 10. Voice STT & TTS ───────────────────────────────────────────────────────
export const transcribeVoice = async (req, res, next) => {
  try {
    const { language = 'en' } = req.body;
    const buffer = req.file ? req.file.buffer : Buffer.from('');
    const mimeType = req.file ? req.file.mimetype : 'audio/webm';

    const result = await voiceService.transcribe(buffer, mimeType, language);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const synthesizeVoice = async (req, res, next) => {
  try {
    const { text, language = 'en', voiceGender = 'neutral' } = req.body;
    const result = await voiceService.synthesize(text, language, voiceGender);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};
