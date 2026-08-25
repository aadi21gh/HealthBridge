import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Practitioner from '../models/Practitioner.js';
import { hashPassword, verifyPassword } from '../security/passwordService.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  getRefreshTokenExpiry,
  verifyAccessToken,
} from '../security/tokenService.js';
import { createError, sendSuccess } from '../utils/errors.js';
import AuditEvent from '../models/AuditEvent.js';
import logger from '../config/logger.js';

const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;

const buildTokenPayload = (user) => ({
  userId: user._id.toString(),
  email: user.email,
  role: user.role,
});

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/api/auth',
  });
};

// ── Register ─────────────────────────────────────────────────────────────────

export const register = async (req, res, next) => {
  try {
    const { email, password, role, firstName, lastName, phone } = req.body;

    // SYSTEM_ADMIN cannot be self-registered
    if (role === 'SYSTEM_ADMIN') {
      return next(createError(403, 'System admin accounts cannot be self-registered'));
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return next(createError(409, 'An account with this email already exists'));
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      email,
      passwordHash,
      role,
      firstName,
      lastName,
      phone,
    });

    // Auto-create profile record based on role
    if (role === 'PATIENT') {
      await Patient.create({ userId: user._id });
    }

    // Practitioners are created by hospital admin or self-registration with org
    // We don't create a Practitioner here — that's done via onboarding flow

    await AuditEvent.create({
      action: 'REGISTER',
      actorId: user._id,
      actorRole: role,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info('New user registered', { userId: user._id, role });

    return sendSuccess(
      res,
      { user: { id: user._id, email: user.email, role: user.role, firstName, lastName } },
      201
    );
  } catch (err) {
    next(err);
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Load user with password hash (select: false field)
    const user = await User.findOne({ email }).select('+passwordHash +refreshTokens');

    if (!user) {
      // Timing-safe: run hash even on miss to prevent timing attacks
      await hashPassword('dummy_password_to_normalize_time');
      return next(createError(401, 'Invalid email or password'));
    }

    if (!user.isActive) {
      return next(createError(401, 'Account has been deactivated'));
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      return next(createError(429, `Account temporarily locked. Try again in ${minutesLeft} minutes.`));
    }

    const passwordValid = await verifyPassword(user.passwordHash, password);

    if (!passwordValid) {
      const newAttempts = (user.failedLoginAttempts || 0) + 1;
      const update = { failedLoginAttempts: newAttempts };
      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        update.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
        logger.warn('Account locked after failed attempts', { userId: user._id });
      }
      await User.updateOne({ _id: user._id }, update);
      return next(createError(401, 'Invalid email or password'));
    }

    // Successful login — reset failed attempts
    const refreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(refreshToken);
    const expiresAt = getRefreshTokenExpiry();

    await User.updateOne(
      { _id: user._id },
      {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
        $push: {
          refreshTokens: {
            tokenHash,
            expiresAt,
            userAgent: req.get('user-agent'),
            ipAddress: req.ip,
          },
        },
      }
    );

    const accessToken = generateAccessToken(buildTokenPayload(user));

    setRefreshCookie(res, refreshToken);

    await AuditEvent.create({
      action: 'LOGIN',
      actorId: user._id,
      actorRole: user.role,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendSuccess(res, {
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Refresh ───────────────────────────────────────────────────────────────────

export const refresh = async (req, res, next) => {
  try {
    // Accept from cookie or body
    const rawToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!rawToken) {
      return next(createError(401, 'Refresh token required'));
    }

    const tokenHash = hashRefreshToken(rawToken);
    const now = new Date();

    const user = await User.findOne({
      'refreshTokens.tokenHash': tokenHash,
      'refreshTokens.expiresAt': { $gt: now },
    }).select('+refreshTokens');

    if (!user) {
      return next(createError(401, 'Invalid or expired refresh token'));
    }

    // Rotate: remove old, add new
    const newRefreshToken = generateRefreshToken();
    const newTokenHash = hashRefreshToken(newRefreshToken);
    const expiresAt = getRefreshTokenExpiry();

    await User.updateOne(
      { _id: user._id },
      {
        $pull: { refreshTokens: { tokenHash } },
        $push: {
          refreshTokens: {
            tokenHash: newTokenHash,
            expiresAt,
            userAgent: req.get('user-agent'),
            ipAddress: req.ip,
          },
        },
      }
    );

    const accessToken = generateAccessToken(buildTokenPayload(user));
    setRefreshCookie(res, newRefreshToken);

    return sendSuccess(res, { accessToken });
  } catch (err) {
    next(err);
  }
};

// ── Logout ────────────────────────────────────────────────────────────────────

export const logout = async (req, res, next) => {
  try {
    const rawToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (rawToken) {
      const tokenHash = hashRefreshToken(rawToken);
      await User.updateOne(
        { _id: req.user?.userId },
        { $pull: { refreshTokens: { tokenHash } } }
      );
    }

    res.clearCookie('refreshToken', { path: '/api/auth' });

    await AuditEvent.create({
      action: 'LOGOUT',
      actorId: req.user?.userId,
      actorRole: req.user?.role,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendSuccess(res, { message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// ── Get current user ──────────────────────────────────────────────────────────

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return next(createError(404, 'User not found'));
    return sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
};
