import Kiosk from '../models/Kiosk.js';
import IntakeSession from '../models/IntakeSession.js';
import AuditEvent from '../models/AuditEvent.js';
import crypto from 'crypto';
import { createError, sendSuccess, sendPaginated } from '../utils/errors.js';
import logger from '../config/logger.js';

// ── 1. Register Kiosk Device ──────────────────────────────────────────────────
export const registerKiosk = async (req, res, next) => {
  try {
    const { name, location, organizationId } = req.body;
    if (!name) return next(createError(400, 'Kiosk name is required'));

    const deviceToken = `kiosk_${crypto.randomBytes(24).toString('hex')}`;

    const kiosk = await Kiosk.create({
      name,
      location: location || 'General Reception',
      organizationId: organizationId || req.user?.organizationId,
      status: 'ONLINE',
      deviceToken,
      registeredBy: req.user.userId,
      softwareVersion: '1.0.0',
      lastActiveAt: new Date(),
    });

    await AuditEvent.create({
      action: 'KIOSK_REGISTER',
      actorId: req.user.userId,
      actorRole: req.user.role,
      organizationId: kiosk.organizationId,
      resourceType: 'Kiosk',
      resourceId: kiosk._id,
      metadata: { name: kiosk.name, location: kiosk.location },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info('Kiosk device registered', { kioskId: kiosk._id, name });

    return sendSuccess(res, {
      kiosk: {
        _id: kiosk._id,
        name: kiosk.name,
        location: kiosk.location,
        status: kiosk.status,
        softwareVersion: kiosk.softwareVersion,
        createdAt: kiosk.createdAt,
      },
      deviceToken, // Return deviceToken once on registration
    }, 201);
  } catch (err) {
    next(err);
  }
};

// ── 2. List Kiosks ────────────────────────────────────────────────────────────
export const listKiosks = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.user?.organizationId) {
      filter.organizationId = req.user.organizationId;
    }
    if (req.query.status) {
      filter.status = req.query.status.toUpperCase();
    }

    const [kiosks, total] = await Promise.all([
      Kiosk.find(filter)
        .populate('organizationId', 'name type')
        .populate('currentSessionId')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Kiosk.countDocuments(filter),
    ]);

    return sendPaginated(res, kiosks, { page, limit, total });
  } catch (err) {
    next(err);
  }
};

// ── 3. Update Kiosk ───────────────────────────────────────────────────────────
export const updateKiosk = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, location, status } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (location !== undefined) updates.location = location;
    if (status) updates.status = status;

    const kiosk = await Kiosk.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!kiosk) return next(createError(404, 'Kiosk not found'));

    return sendSuccess(res, { kiosk });
  } catch (err) {
    next(err);
  }
};

// ── 4. Disable Kiosk ──────────────────────────────────────────────────────────
export const disableKiosk = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const kiosk = await Kiosk.findByIdAndUpdate(
      id,
      {
        status: 'DISABLED',
        disabledAt: new Date(),
        disabledBy: req.user.userId,
        disableReason: reason || 'Disabled by administrator',
      },
      { new: true }
    );

    if (!kiosk) return next(createError(404, 'Kiosk not found'));

    await AuditEvent.create({
      action: 'KIOSK_DISABLE',
      actorId: req.user.userId,
      actorRole: req.user.role,
      organizationId: kiosk.organizationId,
      resourceType: 'Kiosk',
      resourceId: kiosk._id,
      metadata: { reason },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendSuccess(res, { kiosk, message: 'Kiosk disabled successfully' });
  } catch (err) {
    next(err);
  }
};

// ── 5. Get Kiosk Activity ─────────────────────────────────────────────────────
export const getKioskActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const kiosk = await Kiosk.findById(id);
    if (!kiosk) return next(createError(404, 'Kiosk not found'));

    const sessions = await IntakeSession.find({ kioskId: kiosk._id })
      .populate('patientId')
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const auditEvents = await AuditEvent.find({
      $or: [{ resourceId: kiosk._id }, { 'metadata.kioskId': kiosk._id.toString() }],
    })
      .sort({ timestamp: -1 })
      .limit(30)
      .lean();

    return sendSuccess(res, { kiosk, sessions, auditEvents });
  } catch (err) {
    next(err);
  }
};
