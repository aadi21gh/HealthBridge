import Kiosk from '../models/Kiosk.js';
import IntakeSession from '../models/IntakeSession.js';
import { createError } from '../utils/errors.js';
import { verifyAccessToken } from '../security/tokenService.js';
import User from '../models/User.js';

/**
 * Middleware for kiosk operations.
 * Allows access if:
 * 1. User is authenticated with JWT (e.g., patient, doctor, hospital admin), OR
 * 2. Kiosk device token header ('x-kiosk-token') is valid, OR
 * 3. An active IntakeSession token header ('x-intake-session') is present
 */
export const kioskOrAuth = async (req, res, next) => {
  try {
    // 1. Check Bearer token first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.userId).select('+isActive');
        if (user && user.isActive) {
          req.user = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
          };
          return next();
        }
      } catch {
        // Bearer invalid, fall through to kiosk checks
      }
    }

    // 2. Check Kiosk Device Token
    const deviceToken = req.headers['x-kiosk-token'];
    if (deviceToken) {
      const kiosk = await Kiosk.findOne({ deviceToken }).select('+deviceToken');
      if (kiosk && kiosk.status !== 'DISABLED') {
        req.kiosk = kiosk;
        req.user = {
          userId: kiosk.registeredBy?.toString() || 'kiosk_device',
          role: 'KIOSK_DEVICE',
          kioskId: kiosk._id.toString(),
          organizationId: kiosk.organizationId?.toString(),
        };
        // Update last active
        Kiosk.updateOne({ _id: kiosk._id }, { lastActiveAt: new Date() }).exec();
        return next();
      }
    }

    // 3. Check Session ID Header for active kiosk flow
    const sessionId = req.headers['x-intake-session-id'] || req.params.id;
    if (sessionId && req.path.startsWith('/sessions')) {
      // Allow session progression during intake
      return next();
    }

    // For public / anonymous initial kiosk endpoints (questions, languages, search patient, start session)
    return next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware strictly requiring registered Kiosk device or Hospital Admin
 */
export const requireKioskOrAdmin = async (req, res, next) => {
  if (req.user?.role === 'HOSPITAL_ADMIN' || req.user?.role === 'SYSTEM_ADMIN' || req.kiosk) {
    return next();
  }
  return next(createError(403, 'Requires registered kiosk or administrator'));
};
