import Consent from '../models/Consent.js';
import Patient from '../models/Patient.js';
import Practitioner from '../models/Practitioner.js';
import Notification from '../models/Notification.js';
import AuditEvent from '../models/AuditEvent.js';
import { createError, sendSuccess } from '../utils/errors.js';
import logger from '../config/logger.js';

const DEFAULT_CONSENT_DURATION_DAYS = 30;

// ── Doctor: Request access ────────────────────────────────────────────────────

export const requestAccess = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { purpose, scope, durationDays } = req.body;

    const practitioner = await Practitioner.findOne({ userId: req.user.userId });
    if (!practitioner) return next(createError(403, 'Practitioner profile not found'));

    const patient = await Patient.findById(patientId).populate('userId', 'firstName lastName');
    if (!patient) return next(createError(404, 'Patient not found'));

    // Check for existing pending consent from this doctor to this patient
    const existingPending = await Consent.findOne({
      patientId,
      requestingPractitionerId: practitioner._id,
      status: 'PENDING',
    });

    if (existingPending) {
      return next(createError(409, 'A pending access request already exists for this patient'));
    }

    const consent = await Consent.create({
      patientId,
      requestingPractitionerId: practitioner._id,
      requestingOrganizationId: practitioner.organizationId,
      purpose,
      scope,
      status: 'PENDING',
    });

    // Notify patient
    await Notification.create({
      userId: patient.userId._id,
      type: 'CONSENT_REQUEST',
      title: 'New Access Request',
      message: `A doctor has requested access to your medical records for: ${purpose}`,
      relatedResourceType: 'Consent',
      relatedResourceId: consent._id,
    });

    await AuditEvent.create({
      action: 'REQUEST_ACCESS',
      actorId: req.user.userId,
      actorRole: 'DOCTOR',
      patientId,
      organizationId: practitioner.organizationId,
      resourceType: 'Consent',
      resourceId: consent._id,
      purpose,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info('Access requested', { practitionerId: practitioner._id, patientId });

    return sendSuccess(res, { consent }, 201);
  } catch (err) {
    next(err);
  }
};

// ── Patient: Get own consents ─────────────────────────────────────────────────

export const getMyConsents = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    if (!patient) return next(createError(404, 'Patient profile not found'));

    const { status } = req.query;
    const filter = { patientId: patient._id };
    if (status) filter.status = status.toUpperCase();

    const consents = await Consent.find(filter)
      .populate({
        path: 'requestingPractitionerId',
        populate: { path: 'userId', select: 'firstName lastName' },
      })
      .populate('requestingOrganizationId', 'name type')
      .sort({ createdAt: -1 })
      .lean();

    // Auto-expire in memory (without db write for read path)
    const now = new Date();
    const processed = consents.map((c) => {
      if (c.status === 'APPROVED' && c.expiresAt && new Date(c.expiresAt) < now) {
        return { ...c, status: 'EXPIRED' };
      }
      return c;
    });

    return sendSuccess(res, { consents: processed });
  } catch (err) {
    next(err);
  }
};

// ── Patient: Get single consent detail ───────────────────────────────────────

export const getConsentById = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    if (!patient) return next(createError(404, 'Patient profile not found'));

    const consent = await Consent.findOne({ _id: req.params.id, patientId: patient._id })
      .populate({
        path: 'requestingPractitionerId',
        populate: { path: 'userId', select: 'firstName lastName' },
        select: 'specialization licenseNumber',
      })
      .populate('requestingOrganizationId', 'name type address');

    if (!consent) return next(createError(404, 'Consent not found'));

    return sendSuccess(res, { consent });
  } catch (err) {
    next(err);
  }
};

// ── Patient: Approve consent ──────────────────────────────────────────────────

export const approveConsent = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    if (!patient) return next(createError(404, 'Patient profile not found'));

    const consent = await Consent.findOne({ _id: req.params.id, patientId: patient._id });
    if (!consent) return next(createError(404, 'Consent not found'));

    if (consent.status !== 'PENDING') {
      return next(createError(400, `Cannot approve a consent with status '${consent.status}'`));
    }

    const durationDays = req.body.durationDays || DEFAULT_CONSENT_DURATION_DAYS;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    consent.status = 'APPROVED';
    consent.approvedAt = new Date();
    consent.expiresAt = expiresAt;
    await consent.save();

    await AuditEvent.create({
      action: 'APPROVE_CONSENT',
      actorId: req.user.userId,
      actorRole: 'PATIENT',
      patientId: patient._id,
      resourceType: 'Consent',
      resourceId: consent._id,
      consentId: consent._id,
      purpose: consent.purpose,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info('Consent approved', { consentId: consent._id, patientId: patient._id });

    return sendSuccess(res, { consent });
  } catch (err) {
    next(err);
  }
};

// ── Patient: Reject consent ───────────────────────────────────────────────────

export const rejectConsent = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    if (!patient) return next(createError(404, 'Patient profile not found'));

    const consent = await Consent.findOne({ _id: req.params.id, patientId: patient._id });
    if (!consent) return next(createError(404, 'Consent not found'));

    if (consent.status !== 'PENDING') {
      return next(createError(400, `Cannot reject a consent with status '${consent.status}'`));
    }

    consent.status = 'REJECTED';
    consent.rejectedAt = new Date();
    consent.rejectionReason = req.body.reason;
    await consent.save();

    await AuditEvent.create({
      action: 'REJECT_CONSENT',
      actorId: req.user.userId,
      actorRole: 'PATIENT',
      patientId: patient._id,
      resourceType: 'Consent',
      resourceId: consent._id,
      consentId: consent._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendSuccess(res, { consent });
  } catch (err) {
    next(err);
  }
};

// ── Patient: Revoke consent (immediate effect) ────────────────────────────────

export const revokeConsent = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    if (!patient) return next(createError(404, 'Patient profile not found'));

    const consent = await Consent.findOne({ _id: req.params.id, patientId: patient._id });
    if (!consent) return next(createError(404, 'Consent not found'));

    if (consent.status !== 'APPROVED') {
      return next(createError(400, `Can only revoke an APPROVED consent. Current status: '${consent.status}'`));
    }

    consent.status = 'REVOKED';
    consent.revokedAt = new Date();
    consent.revocationReason = req.body.reason;
    await consent.save();

    await AuditEvent.create({
      action: 'REVOKE_CONSENT',
      actorId: req.user.userId,
      actorRole: 'PATIENT',
      patientId: patient._id,
      resourceType: 'Consent',
      resourceId: consent._id,
      consentId: consent._id,
      purpose: consent.purpose,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info('Consent revoked', { consentId: consent._id, patientId: patient._id });

    return sendSuccess(res, { consent, message: 'Consent revoked. Access has been immediately terminated.' });
  } catch (err) {
    next(err);
  }
};

// ── Doctor: Get own pending and approved consents ─────────────────────────────

export const getDoctorConsents = async (req, res, next) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user.userId });
    if (!practitioner) return next(createError(404, 'Practitioner profile not found'));

    const { status } = req.query;
    const filter = { requestingPractitionerId: practitioner._id };
    if (status) filter.status = status.toUpperCase();

    const consents = await Consent.find(filter)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'firstName lastName' },
      })
      .populate('requestingOrganizationId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, { consents });
  } catch (err) {
    next(err);
  }
};
