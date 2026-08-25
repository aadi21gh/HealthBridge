import { verifyAccessToken } from '../security/tokenService.js';
import User from '../models/User.js';
import { createError } from '../utils/errors.js';

/**
 * Authenticate middleware — validates Bearer JWT and attaches req.user.
 * Does NOT check roles or consent — those are separate middleware layers.
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createError(401, 'Authentication required'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(createError(401, 'Invalid authorization header format'));
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(createError(401, 'Access token expired'));
      }
      return next(createError(401, 'Invalid access token'));
    }

    // Load user from DB to verify account is still active
    const user = await User.findById(decoded.userId).select('+isActive');
    if (!user || !user.isActive) {
      return next(createError(401, 'Account not found or deactivated'));
    }

    // Attach minimal user context to request
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Require one of the specified roles. Must be used AFTER authenticate().
 * Usage: requireRole('DOCTOR', 'HOSPITAL_ADMIN')
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError(401, 'Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(createError(403, 'Insufficient permissions for this action'));
    }
    next();
  };
};

/**
 * Require the user to be a SYSTEM_ADMIN.
 */
export const requireAdmin = requireRole('SYSTEM_ADMIN');
