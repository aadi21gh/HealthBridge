import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import { consentGate } from '../middleware/consentGate.js';
import { auditLog } from '../middleware/auditLog.js';
import * as patientController from '../controllers/patientController.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ── Patient: own data ─────────────────────────────────────────────────────────

// GET /api/patients/me
router.get(
  '/me',
  requireRole('PATIENT'),
  auditLog('VIEW_PATIENT', 'Patient'),
  patientController.getMyProfile
);

// PUT /api/patients/me
router.put(
  '/me',
  requireRole('PATIENT'),
  patientController.updateMyProfile
);

// GET /api/patients/me/timeline
router.get(
  '/me/timeline',
  requireRole('PATIENT'),
  auditLog('VIEW_RECORD', 'Timeline'),
  patientController.getMyTimeline
);

// GET /api/patients/me/summary
router.get(
  '/me/summary',
  requireRole('PATIENT'),
  patientController.getMySummary
);

// ── Doctor: authorized patient access ────────────────────────────────────────

// GET /api/patients/search
router.get(
  '/search',
  requireRole('DOCTOR', 'HOSPITAL_ADMIN', 'SYSTEM_ADMIN'),
  patientController.searchPatients
);

// GET /api/patients/:patientId
// Doctor must have approved consent — consentGate enforces this
router.get(
  '/:patientId',
  requireRole('DOCTOR', 'HOSPITAL_ADMIN', 'SYSTEM_ADMIN'),
  consentGate(), // null scope = just checks consent existence
  auditLog('VIEW_PATIENT', 'Patient'),
  patientController.getPatientById
);

export default router;
