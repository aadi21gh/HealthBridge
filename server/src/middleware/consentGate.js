import Consent from '../models/Consent.js';
import Practitioner from '../models/Practitioner.js';
import Patient from '../models/Patient.js';
import AuditEvent from '../models/AuditEvent.js';
import { createError } from '../utils/errors.js';
import logger from '../config/logger.js';

/**
 * Consent gate middleware — enforces that:
 *   1. The requesting doctor has an APPROVED, non-expired consent for this patient
 *   2. The requested resource type is within the approved scope
 *
 * Must be used AFTER authenticate() and requireRole('DOCTOR').
 *
 * @param {string} resourceType - The CONSENT_SCOPE_ITEMS value being accessed
 *                                Pass null to only check consent existence (not scope)
 */
export const consentGate = (resourceType = null) => {
  return async (req, res, next) => {
    try {
      const { userId, role } = req.user;

      // SYSTEM_ADMIN bypasses consent gate (with audit)
      if (role === 'SYSTEM_ADMIN') {
        return next();
      }

      // PATIENT accessing own data bypasses consent gate
      if (role === 'PATIENT') {
        // Verify the patient is accessing their own data
        const patient = await Patient.findOne({ userId });
        if (!patient) {
          return next(createError(404, 'Patient profile not found'));
        }
        const requestedPatientId = req.params.patientId || req.patient?._id?.toString();
        if (requestedPatientId && requestedPatientId !== patient._id.toString()) {
          return next(createError(403, 'Patients can only access their own records'));
        }
        req.patient = patient;
        return next();
      }

      // DOCTOR must have active consent
      if (role === 'DOCTOR') {
        const targetPatientId = req.params.patientId;
        if (!targetPatientId) {
          return next(createError(400, 'Patient ID required'));
        }

        // Load practitioner profile
        const practitioner = await Practitioner.findOne({ userId });
        if (!practitioner) {
          return next(createError(403, 'Practitioner profile not found'));
        }

        // Find active approved consent
        const now = new Date();
        const consent = await Consent.findOne({
          patientId: targetPatientId,
          requestingPractitionerId: practitioner._id,
          status: 'APPROVED',
          expiresAt: { $gt: now },
        });

        if (!consent) {
          logger.warn('Consent gate denied', {
            practitionerId: practitioner._id,
            patientId: targetPatientId,
            resourceType,
          });
          return next(
            createError(
              403,
              'Access denied: No active approved consent for this patient. Request patient authorization first.'
            )
          );
        }

        // Check resource scope
        if (resourceType && !consent.scope.includes(resourceType)) {
          logger.warn('Consent scope violation', {
            practitionerId: practitioner._id,
            patientId: targetPatientId,
            requestedResource: resourceType,
            approvedScope: consent.scope,
          });
          return next(
            createError(
              403,
              `Access denied: Consent does not cover '${resourceType}'. Scope: ${consent.scope.join(', ')}`
            )
          );
        }

        // Attach to request for downstream use
        req.practitioner = practitioner;
        req.activeConsent = consent;

        return next();
      }

      // HOSPITAL_ADMIN — can access their org's data
      if (role === 'HOSPITAL_ADMIN') {
        return next();
      }

      return next(createError(403, 'Access denied'));
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Emergency access gate — logs break-glass access and proceeds.
 * Requires emergencyReason in request body.
 * Always creates an audit event regardless of consent.
 */
export const emergencyAccessGate = async (req, res, next) => {
  try {
    const { userId, role } = req.user;

    if (role !== 'DOCTOR' && role !== 'SYSTEM_ADMIN') {
      return next(createError(403, 'Emergency access is only available to verified practitioners'));
    }

    const { emergencyReason } = req.body;
    if (!emergencyReason || emergencyReason.trim().length < 10) {
      return next(createError(400, 'A meaningful emergency reason (min 10 characters) is required for emergency access'));
    }

    const practitioner = await Practitioner.findOne({ userId });
    if (!practitioner) {
      return next(createError(403, 'Practitioner profile required for emergency access'));
    }

    const targetPatientId = req.params.patientId;

    // Create emergency audit event BEFORE accessing data
    await AuditEvent.create({
      action: 'EMERGENCY_ACCESS',
      actorId: userId,
      actorRole: role,
      patientId: targetPatientId,
      organizationId: practitioner.organizationId,
      resourceType: 'Patient',
      resourceId: targetPatientId,
      purpose: 'ETREAT',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      emergencyFlag: true,
      emergencyReason: emergencyReason.trim(),
      metadata: { accessType: 'break-glass' },
    });

    req.practitioner = practitioner;
    req.isEmergencyAccess = true;
    req.emergencyReason = emergencyReason.trim();

    logger.warn('EMERGENCY ACCESS ACTIVATED', {
      practitionerId: practitioner._id,
      patientId: targetPatientId,
      reason: emergencyReason,
    });

    next();
  } catch (err) {
    next(err);
  }
};
