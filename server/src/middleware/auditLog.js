import AuditEvent from '../models/AuditEvent.js';
import logger from '../config/logger.js';

/**
 * Audit logging middleware factory.
 * Creates an audit event AFTER the response is sent (non-blocking).
 *
 * Usage: auditLog('VIEW_RECORD', 'Condition')
 *
 * @param {string} action - Audit action enum value
 * @param {string} [resourceType] - Optional resource type being accessed
 */
export const auditLog = (action, resourceType = null) => {
  return (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      // Restore and call original
      res.json = originalJson;
      const result = originalJson(body);

      // Only audit successful responses (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const auditData = {
          action,
          actorId: req.user?.userId,
          actorRole: req.user?.role,
          patientId: req.params?.patientId || req.patient?._id,
          organizationId: req.practitioner?.organizationId,
          resourceType,
          resourceId: req.params?.id || req.params?.recordId,
          consentId: req.activeConsent?._id,
          purpose: req.activeConsent?.purpose || req.body?.purpose,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          emergencyFlag: req.isEmergencyAccess || false,
          emergencyReason: req.emergencyReason,
        };

        // Fire-and-forget — never block the response for audit
        AuditEvent.create(auditData).catch((err) => {
          logger.error('Failed to write audit event', { err, action, actorId: req.user?.userId });
        });
      }

      return result;
    };

    next();
  };
};
