import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import { consentGate } from '../middleware/consentGate.js';
import { auditLog } from '../middleware/auditLog.js';
import MedicalRecordSearch from '../ai/MedicalRecordSearch.js';
import Patient from '../models/Patient.js';
import { createError, sendSuccess } from '../utils/errors.js';

const router = Router();
const aiSearch = new MedicalRecordSearch();

router.use(authenticate);

// POST /api/ai/search — Doctor asks questions about authorized records
router.post(
  '/search',
  requireRole('DOCTOR', 'SYSTEM_ADMIN'),
  async (req, res, next) => {
    req.params.patientId = req.body.patientId;
    next();
  },
  consentGate(), // Doctor must have active consent
  auditLog('AI_QUERY', 'AI_Search'),
  async (req, res, next) => {
    try {
      const { patientId, query } = req.body;
      if (!patientId || !query) {
        return next(createError(400, 'patientId and query are required'));
      }

      const scope = req.activeConsent?.scope || [];
      const result = await aiSearch.search(patientId, query, scope);

      return sendSuccess(res, {
        query,
        answer: result.answer,
        sources: result.sources,
        guardrailTriggered: result.guardrailTriggered,
        disclaimer: 'AI-generated summary based solely on authorized clinical records. Not a substitute for professional medical judgment.',
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/ai/summarize — Patient or Doctor requests clinical summary
router.post(
  '/summarize',
  requireRole('PATIENT', 'DOCTOR', 'SYSTEM_ADMIN'),
  async (req, res, next) => {
    if (req.user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user.userId });
      if (!patient) return next(createError(404, 'Patient profile not found'));
      req.params.patientId = patient._id.toString();
      req.patientScope = ['conditions', 'allergies', 'medications', 'procedures', 'observations', 'diagnosticReports'];
      return next();
    }
    req.params.patientId = req.body.patientId;
    next();
  },
  consentGate(),
  auditLog('AI_QUERY', 'AI_Summary'),
  async (req, res, next) => {
    try {
      const patientId = req.params.patientId;
      const scope = req.patientScope || req.activeConsent?.scope || [];

      const result = await aiSearch.summarize(patientId, scope);

      return sendSuccess(res, {
        summary: result.summary,
        recordCount: result.recordCount,
        generatedAt: result.generatedAt,
        disclaimer: 'AI-generated summary based strictly on documented medical records.',
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
