import { Router } from 'express';
import multer from 'multer';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import { kioskOrAuth } from '../middleware/kioskAuth.js';
import { auditLog } from '../middleware/auditLog.js';
import * as intakeController from '../controllers/intakeController.js';
import * as doctorIntakeController from '../controllers/doctorIntakeController.js';
import * as intakeAnalyticsController from '../controllers/intakeAnalyticsController.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

// ── Kiosk Public & Session Operations ─────────────────────────────────────────

// POST /api/intake/patient-search — identify patient on kiosk
router.post('/patient-search', kioskOrAuth, intakeController.searchPatientForKiosk);

// POST /api/intake/sessions — Start new intake session
router.post('/sessions', kioskOrAuth, intakeController.startSession);

// GET /api/intake/sessions/:id — Get session status & next question
router.get('/sessions/:id', kioskOrAuth, intakeController.getSession);

// POST /api/intake/sessions/:id/answer — Submit answer
router.post('/sessions/:id/answer', kioskOrAuth, intakeController.submitAnswer);

// POST /api/intake/sessions/:id/documents — Upload physical document from kiosk
router.post('/sessions/:id/documents', kioskOrAuth, upload.single('file'), intakeController.uploadSessionDocument);

// POST /api/intake/sessions/:id/complete — Finalize intake session
router.post('/sessions/:id/complete', kioskOrAuth, intakeController.completeSession);

// POST /api/intake/sessions/:id/abandon — Abandon session
router.post('/sessions/:id/abandon', kioskOrAuth, intakeController.abandonSession);

// GET /api/intake/questions — Get full question bank
router.get('/questions', intakeController.getQuestions);

// GET /api/intake/questions/:language — Get translated questions
router.get('/questions/:language', intakeController.getQuestions);

// ── AYUSH Intake ─────────────────────────────────────────────────────────────

// GET /api/intake/ayush/:discipline
router.get('/ayush/:discipline', intakeController.getAyushDiscipline);

// POST /api/intake/ayush/:discipline/assessment
router.post('/ayush/:discipline/assessment', kioskOrAuth, intakeController.submitAyushAssessment);

// ── Voice Service ────────────────────────────────────────────────────────────

// POST /api/intake/voice/transcribe
router.post('/voice/transcribe', kioskOrAuth, upload.single('audio'), intakeController.transcribeVoice);

// POST /api/intake/voice/synthesize
router.post('/voice/synthesize', kioskOrAuth, intakeController.synthesizeVoice);

// ── Doctor Intake Verification Workflow ───────────────────────────────────────

// GET /api/intake/doctor/briefing/:sessionId
router.get(
  '/doctor/briefing/:sessionId',
  authenticate,
  requireRole('DOCTOR', 'HOSPITAL_ADMIN', 'SYSTEM_ADMIN'),
  auditLog('VIEW_RECORD', 'IntakeBriefing'),
  doctorIntakeController.getIntakeBriefing
);

// POST /api/intake/doctor/facts/:factId/verify
router.post(
  '/doctor/facts/:factId/verify',
  authenticate,
  requireRole('DOCTOR'),
  doctorIntakeController.verifyFact
);

// POST /api/intake/doctor/sessions/:sessionId/finalize
router.post(
  '/doctor/sessions/:sessionId/finalize',
  authenticate,
  requireRole('DOCTOR'),
  auditLog('CREATE_RECORD', 'IntakeFinalization'),
  doctorIntakeController.finalizeAndPromoteToRecords
);

// ── Analytics ────────────────────────────────────────────────────────────────

// GET /api/intake/analytics
router.get(
  '/analytics',
  authenticate,
  requireRole('DOCTOR', 'HOSPITAL_ADMIN', 'SYSTEM_ADMIN'),
  intakeAnalyticsController.getIntakeAnalytics
);

export default router;
