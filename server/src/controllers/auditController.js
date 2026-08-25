import AuditEvent from '../models/AuditEvent.js';
import Patient from '../models/Patient.js';
import { createError, sendSuccess, sendPaginated } from '../utils/errors.js';

// ── Patient: Get own audit history ────────────────────────────────────────────

export const getMyAuditHistory = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    if (!patient) return next(createError(404, 'Patient profile not found'));

    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const filter = { patientId: patient._id };
    if (req.query.action) filter.action = req.query.action;
    if (req.query.emergencyOnly === 'true') filter.emergencyFlag = true;

    const [events, total] = await Promise.all([
      AuditEvent.find(filter)
        .populate('actorId', 'firstName lastName role')
        .populate('organizationId', 'name')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditEvent.countDocuments(filter),
    ]);

    return sendPaginated(res, events, { page, limit, total });
  } catch (err) {
    next(err);
  }
};

// ── System Admin: Get audit for any patient ───────────────────────────────────

export const getPatientAuditHistory = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const filter = { patientId };
    if (req.query.action) filter.action = req.query.action;

    const [events, total] = await Promise.all([
      AuditEvent.find(filter)
        .populate('actorId', 'firstName lastName role')
        .populate('organizationId', 'name')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditEvent.countDocuments(filter),
    ]);

    return sendPaginated(res, events, { page, limit, total });
  } catch (err) {
    next(err);
  }
};

// ── System Admin: Get all audit events ───────────────────────────────────────

export const getAllAuditEvents = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '50', 10)));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.actorRole) filter.actorRole = req.query.actorRole;
    if (req.query.emergencyOnly === 'true') filter.emergencyFlag = true;

    const [events, total] = await Promise.all([
      AuditEvent.find(filter)
        .populate('actorId', 'firstName lastName role')
        .populate('patientId')
        .populate('organizationId', 'name')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditEvent.countDocuments(filter),
    ]);

    return sendPaginated(res, events, { page, limit, total });
  } catch (err) {
    next(err);
  }
};
