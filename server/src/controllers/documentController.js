import crypto from 'crypto';
import Document from '../models/Document.js';
import Patient from '../models/Patient.js';
import LocalStorageProvider from '../storage/LocalStorageProvider.js';
import { createError, sendSuccess, sendPaginated } from '../utils/errors.js';
import logger from '../config/logger.js';

const storage = new LocalStorageProvider();

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(createError(400, 'File is required'));
    }

    const { documentType, title, encounterId, recordDate } = req.body;
    let targetPatientId = req.body.patientId;

    if (req.user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user.userId });
      if (!patient) return next(createError(404, 'Patient profile not found'));
      targetPatientId = patient._id;
    }

    if (!targetPatientId) {
      return next(createError(400, 'patientId is required'));
    }

    const storageKey = `patients/${targetPatientId}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${req.file.originalname}`;

    await storage.saveFile(req.file.buffer, storageKey, req.file.mimetype);

    const doc = await Document.create({
      patientId: targetPatientId,
      uploadedBy: req.user.userId,
      documentType: documentType || 'OTHER',
      title: title || req.file.originalname,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      storageKey,
      encounterId: encounterId || null,
      recordDate: recordDate ? new Date(recordDate) : new Date(),
      status: 'READY',
    });

    logger.info('Document uploaded successfully', { docId: doc._id, patientId: targetPatientId });

    return sendSuccess(res, { document: doc }, 201);
  } catch (err) {
    next(err);
  }
};

export const getDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return next(createError(404, 'Document not found'));

    return sendSuccess(res, { document: doc });
  } catch (err) {
    next(err);
  }
};

export const downloadDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id).select('+storageKey');
    if (!doc) return next(createError(404, 'Document not found'));

    const stream = await storage.getFileStream(doc.storageKey);
    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${doc.fileName}"`);

    stream.pipe(res);
  } catch (err) {
    next(err);
  }
};

export const listDocuments = async (req, res, next) => {
  try {
    let patientId = req.params.patientId;
    if (req.user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user.userId });
      if (!patient) return next(createError(404, 'Patient profile not found'));
      patientId = patient._id;
    }

    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const filter = { patientId };
    if (req.query.documentType) filter.documentType = req.query.documentType;

    const [documents, total] = await Promise.all([
      Document.find(filter).sort({ recordDate: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Document.countDocuments(filter),
    ]);

    return sendPaginated(res, documents, { page, limit, total });
  } catch (err) {
    next(err);
  }
};
