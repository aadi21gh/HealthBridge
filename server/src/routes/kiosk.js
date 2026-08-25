import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import * as kioskController from '../controllers/kioskController.js';

const router = Router();

router.use(authenticate);

// POST /api/kiosks/register — Hospital Admin / System Admin registers a new kiosk
router.post(
  '/register',
  requireRole('HOSPITAL_ADMIN', 'SYSTEM_ADMIN'),
  kioskController.registerKiosk
);

// GET /api/kiosks — List all registered kiosks
router.get(
  '/',
  requireRole('HOSPITAL_ADMIN', 'SYSTEM_ADMIN', 'DOCTOR'),
  kioskController.listKiosks
);

// PATCH /api/kiosks/:id — Update kiosk details
router.patch(
  '/:id',
  requireRole('HOSPITAL_ADMIN', 'SYSTEM_ADMIN'),
  kioskController.updateKiosk
);

// POST /api/kiosks/:id/disable — Remotely disable kiosk
router.post(
  '/:id/disable',
  requireRole('HOSPITAL_ADMIN', 'SYSTEM_ADMIN'),
  kioskController.disableKiosk
);

// GET /api/kiosks/:id/activity — Kiosk activity log
router.get(
  '/:id/activity',
  requireRole('HOSPITAL_ADMIN', 'SYSTEM_ADMIN'),
  kioskController.getKioskActivity
);

export default router;
