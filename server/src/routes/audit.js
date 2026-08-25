import { Router } from 'express';
import { authenticate, requireRole, requireAdmin } from '../middleware/authenticate.js';
import * as auditController from '../controllers/auditController.js';

const router = Router();
router.use(authenticate);

// GET /api/audit/me — patient sees own audit trail
router.get('/me', requireRole('PATIENT'), auditController.getMyAuditHistory);

// GET /api/audit/patient/:patientId — admin views any patient's audit trail
router.get('/patient/:patientId', requireAdmin, auditController.getPatientAuditHistory);

// GET /api/audit/all — admin views all events
router.get('/all', requireAdmin, auditController.getAllAuditEvents);

export default router;
