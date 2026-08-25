import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import { consentGate, emergencyAccessGate } from '../middleware/consentGate.js';
import { auditLog } from '../middleware/auditLog.js';
import * as recordsController from '../controllers/recordsController.js';

const router = Router();
router.use(authenticate);

// ── Patient: own records ──────────────────────────────────────────────────────

const resourceTypes = [
  'conditions', 'allergies', 'medications', 'procedures',
  'observations', 'diagnosticReports', 'imagingStudies', 'immunizations',
];

// GET /api/records/me/:resourceType
router.get(
  '/me/:resourceType',
  requireRole('PATIENT'),
  (req, res, next) => {
    if (!resourceTypes.includes(req.params.resourceType)) {
      return res.status(400).json({ success: false, error: { message: 'Unknown resource type' } });
    }
    next();
  },
  auditLog('VIEW_RECORD'),
  (req, res, next) => recordsController.listRecords(req.params.resourceType)(req, res, next)
);

// ── Doctor: authorized patient records ───────────────────────────────────────

// GET /api/records/patient/:patientId/view
// Returns all records within consent scope in one call
router.get(
  '/patient/:patientId/view',
  requireRole('DOCTOR'),
  consentGate(), // scope enforced inside getDoctorPatientView
  auditLog('VIEW_RECORD', 'MultiResource'),
  recordsController.getDoctorPatientView
);

// GET /api/records/patient/:patientId/:resourceType
router.get(
  '/patient/:patientId/:resourceType',
  requireRole('DOCTOR', 'SYSTEM_ADMIN'),
  (req, res, next) => {
    if (!resourceTypes.includes(req.params.resourceType)) {
      return res.status(400).json({ success: false, error: { message: 'Unknown resource type' } });
    }
    next();
  },
  consentGate(null), // resource-level scope checked inside listRecords
  auditLog('VIEW_RECORD'),
  (req, res, next) => recordsController.listRecords(req.params.resourceType)(req, res, next)
);

// POST /api/records/patient/:patientId/:resourceType
router.post(
  '/patient/:patientId/:resourceType',
  requireRole('DOCTOR', 'HOSPITAL_ADMIN'),
  (req, res, next) => {
    if (!resourceTypes.includes(req.params.resourceType)) {
      return res.status(400).json({ success: false, error: { message: 'Unknown resource type' } });
    }
    next();
  },
  auditLog('CREATE_RECORD'),
  (req, res, next) => recordsController.createRecord(req.params.resourceType)(req, res, next)
);

// ── Emergency access ──────────────────────────────────────────────────────────

// POST /api/records/emergency/:patientId
// emergencyAccessGate creates audit BEFORE the response
router.post(
  '/emergency/:patientId',
  requireRole('DOCTOR', 'SYSTEM_ADMIN'),
  emergencyAccessGate,
  recordsController.getEmergencyPatientInfo
);

export default router;
