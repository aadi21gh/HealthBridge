import { Router } from 'express';
import multer from 'multer';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import { consentGate } from '../middleware/consentGate.js';
import { auditLog } from '../middleware/auditLog.js';
import * as documentController from '../controllers/documentController.js';
import { createError } from '../utils/errors.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(createError(400, 'Invalid file type. Only PDF, PNG, and JPEG are allowed.'));
    }
  },
});

router.use(authenticate);

// POST /api/documents/upload
router.post(
  '/upload',
  upload.single('file'),
  auditLog('UPLOAD_DOCUMENT', 'Document'),
  documentController.uploadDocument
);

// GET /api/documents/patient/:patientId
router.get(
  '/patient/:patientId',
  consentGate('documents'),
  auditLog('VIEW_DOCUMENT', 'Document'),
  documentController.listDocuments
);

// GET /api/documents/:id
router.get(
  '/:id',
  auditLog('VIEW_DOCUMENT', 'Document'),
  documentController.getDocument
);

// GET /api/documents/:id/download
router.get(
  '/:id/download',
  auditLog('DOWNLOAD_DOCUMENT', 'Document'),
  documentController.downloadDocument
);

export default router;
