import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import { auditLog } from '../middleware/auditLog.js';
import * as consentController from '../controllers/consentController.js';

const router = Router();
router.use(authenticate);

// ── Doctor: Request access ────────────────────────────────────────────────────

// POST /api/consents/request/:patientId
router.post(
  '/request/:patientId',
  requireRole('DOCTOR'),
  auditLog('REQUEST_ACCESS', 'Consent'),
  consentController.requestAccess
);

// GET /api/consents/doctor
router.get(
  '/doctor',
  requireRole('DOCTOR'),
  consentController.getDoctorConsents
);

// ── Patient: Manage own consents ──────────────────────────────────────────────

// GET /api/consents
router.get(
  '/',
  requireRole('PATIENT'),
  consentController.getMyConsents
);

// GET /api/consents/:id
router.get(
  '/:id',
  requireRole('PATIENT'),
  consentController.getConsentById
);

// POST /api/consents/:id/approve
router.post(
  '/:id/approve',
  requireRole('PATIENT'),
  auditLog('APPROVE_CONSENT', 'Consent'),
  consentController.approveConsent
);

// POST /api/consents/:id/reject
router.post(
  '/:id/reject',
  requireRole('PATIENT'),
  auditLog('REJECT_CONSENT', 'Consent'),
  consentController.rejectConsent
);

// POST /api/consents/:id/revoke
router.post(
  '/:id/revoke',
  requireRole('PATIENT'),
  auditLog('REVOKE_CONSENT', 'Consent'),
  consentController.revokeConsent
);

export default router;
