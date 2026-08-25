import IntakeSession from '../models/IntakeSession.js';
import ClinicalFact from '../models/ClinicalFact.js';
import Condition from '../models/Condition.js';
import Procedure from '../models/Procedure.js';
import Medication from '../models/Medication.js';
import Allergy from '../models/Allergy.js';
import Practitioner from '../models/Practitioner.js';
import AuditEvent from '../models/AuditEvent.js';
import AyushAssessment from '../models/AyushAssessment.js';
import Document from '../models/Document.js';
import { createError, sendSuccess } from '../utils/errors.js';
import logger from '../config/logger.js';

// ── 1. Get Pre-Consultation Intake Briefing for Doctor ─────────────────────────
export const getIntakeBriefing = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await IntakeSession.findById(sessionId)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'firstName lastName email phone' },
      })
      .populate('organizationId', 'name type')
      .populate('documentIds');

    if (!session) return next(createError(404, 'Intake session not found'));

    // Fetch all clinical facts associated with this intake session
    const facts = await ClinicalFact.find({ intakeSessionId: session._id })
      .populate('sourceDocumentId', 'fileName documentType createdAt')
      .populate('verifiedBy', 'userId specialization')
      .lean();

    // Group facts by category
    const categorizedFacts = {
      chief_complaint: facts.filter((f) => f.category === 'chief_complaint'),
      condition: facts.filter((f) => f.category === 'condition'),
      surgery: facts.filter((f) => f.category === 'surgery' || f.category === 'procedure'),
      medication: facts.filter((f) => f.category === 'medication'),
      allergy: facts.filter((f) => f.category === 'allergy'),
      family_history: facts.filter((f) => f.category === 'family_history'),
      lifestyle: facts.filter((f) => f.category === 'lifestyle' || f.category === 'diet' || f.category === 'sleep'),
      other: facts.filter((f) => !['chief_complaint', 'condition', 'surgery', 'medication', 'allergy', 'family_history', 'lifestyle', 'diet', 'sleep'].includes(f.category)),
    };

    // Fetch AYUSH assessment if discipline != MODERN_MEDICINE
    let ayushData = null;
    if (session.discipline !== 'MODERN_MEDICINE') {
      ayushData = await AyushAssessment.findOne({ intakeSessionId: session._id }).lean();
    }

    return sendSuccess(res, {
      session,
      patient: session.patientId,
      facts,
      categorizedFacts,
      redFlags: session.redFlags || [],
      documents: session.documentIds || [],
      ayushData,
      summary: session.summary,
    });
  } catch (err) {
    next(err);
  }
};

// ── 2. Doctor: Verify, Edit, or Reject a Clinical Fact ─────────────────────────
export const verifyFact = async (req, res, next) => {
  try {
    const { factId } = req.params;
    const { action, editedConcept, editedValue, doctorNotes } = req.body; // action: 'ACCEPT' | 'EDIT' | 'REJECT'

    const practitioner = await Practitioner.findOne({ userId: req.user.userId });
    if (!practitioner) return next(createError(403, 'Practitioner profile required'));

    const fact = await ClinicalFact.findById(factId);
    if (!fact) return next(createError(404, 'Clinical fact not found'));

    if (action === 'REJECT') {
      fact.verificationStatus = 'REJECTED';
      fact.verified = false;
      fact.verifiedBy = practitioner._id;
      fact.verifiedAt = new Date();
      fact.doctorNotes = doctorNotes || 'Rejected by clinician';
      await fact.save();

      await AuditEvent.create({
        action: 'DOCTOR_REJECT_FACT',
        actorId: req.user.userId,
        actorRole: 'DOCTOR',
        patientId: fact.patientId,
        resourceType: 'ClinicalFact',
        resourceId: fact._id,
        metadata: { concept: fact.concept, notes: doctorNotes },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      return sendSuccess(res, { fact, message: 'Fact rejected' });
    }

    // ACCEPT or EDIT
    fact.verificationStatus = action === 'EDIT' ? 'EDITED' : 'ACCEPTED';
    fact.verified = true;
    fact.source = 'DOCTOR_VERIFIED';
    fact.verifiedBy = practitioner._id;
    fact.verifiedAt = new Date();
    fact.doctorNotes = doctorNotes || null;

    if (editedConcept) fact.concept = editedConcept;
    if (editedValue !== undefined) fact.value = editedValue;

    await fact.save();

    await AuditEvent.create({
      action: 'DOCTOR_VERIFY_FACT',
      actorId: req.user.userId,
      actorRole: 'DOCTOR',
      patientId: fact.patientId,
      resourceType: 'ClinicalFact',
      resourceId: fact._id,
      metadata: { concept: fact.concept, action },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendSuccess(res, { fact, message: `Fact ${action === 'EDIT' ? 'edited and verified' : 'verified'}` });
  } catch (err) {
    next(err);
  }
};

// ── 3. Doctor: Finalize Intake & Promote Facts to Medical Records ──────────────
export const finalizeAndPromoteToRecords = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const practitioner = await Practitioner.findOne({ userId: req.user.userId });
    if (!practitioner) return next(createError(403, 'Practitioner profile required'));

    const session = await IntakeSession.findById(sessionId);
    if (!session) return next(createError(404, 'Intake session not found'));

    // Find all verified facts that haven't been promoted yet
    const verifiedFacts = await ClinicalFact.find({
      intakeSessionId: session._id,
      verified: true,
      promotedResourceId: { $exists: false },
    });

    const promotedRecords = [];

    for (const fact of verifiedFacts) {
      if (fact.category === 'condition') {
        const condition = await Condition.create({
          patientId: fact.patientId,
          display: fact.concept,
          clinicalStatus: 'active',
          verificationStatus: 'confirmed',
          recordedBy: practitioner._id,
          organizationId: practitioner.organizationId,
          notes: `Verified from kiosk intake: ${fact.originalText || ''}`,
          sourceDocumentId: fact.sourceDocumentId,
        });
        fact.promotedResourceType = 'Condition';
        fact.promotedResourceId = condition._id;
        await fact.save();
        promotedRecords.push({ type: 'Condition', id: condition._id, display: condition.display });
      } else if (fact.category === 'surgery' || fact.category === 'procedure') {
        const procedure = await Procedure.create({
          patientId: fact.patientId,
          display: fact.concept,
          status: 'completed',
          isSurgery: true,
          performedBy: practitioner._id,
          organizationId: practitioner.organizationId,
          notes: `Documented via kiosk intake (approx date: ${fact.approximateDate || 'N/A'})`,
          sourceDocumentId: fact.sourceDocumentId,
        });
        fact.promotedResourceType = 'Procedure';
        fact.promotedResourceId = procedure._id;
        await fact.save();
        promotedRecords.push({ type: 'Procedure', id: procedure._id, display: procedure.display });
      } else if (fact.category === 'allergy') {
        const allergy = await Allergy.create({
          patientId: fact.patientId,
          display: fact.concept,
          criticality: 'unable-to-assess',
          verificationStatus: 'confirmed',
          recordedBy: practitioner._id,
          organizationId: practitioner.organizationId,
          notes: `Recorded in kiosk intake: ${fact.originalText || ''}`,
        });
        fact.promotedResourceType = 'Allergy';
        fact.promotedResourceId = allergy._id;
        await fact.save();
        promotedRecords.push({ type: 'Allergy', id: allergy._id, display: allergy.display });
      } else if (fact.category === 'medication') {
        const medication = await Medication.create({
          patientId: fact.patientId,
          medicationDisplay: fact.concept,
          status: 'active',
          prescribedBy: practitioner._id,
          organizationId: practitioner.organizationId,
          notes: `Patient-reported current medication verified by clinician.`,
        });
        fact.promotedResourceType = 'Medication';
        fact.promotedResourceId = medication._id;
        await fact.save();
        promotedRecords.push({ type: 'Medication', id: medication._id, display: medication.medicationDisplay });
      }
    }

    session.doctorVerification = {
      verifiedBy: practitioner._id,
      verifiedAt: new Date(),
      status: 'VERIFIED',
      notes: req.body.notes || 'All relevant facts verified and integrated into longitudinal record.',
    };
    await session.save();

    logger.info('Intake session finalized and promoted to medical record', {
      sessionId: session._id,
      promotedCount: promotedRecords.length,
    });

    return sendSuccess(res, {
      message: 'Intake verified and integrated into patient longitudinal medical record.',
      promotedRecords,
      session,
    });
  } catch (err) {
    next(err);
  }
};
