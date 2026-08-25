import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index.js';

/**
 * Generate a short-lived access token (15 min by default).
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
    issuer: 'healthbridge',
    audience: 'healthbridge-client',
  });
};

/**
 * Generate a long-lived refresh token (7 days by default).
 * Returns the raw token string. Hash it before storing.
 */
export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Hash a refresh token for storage. We store the hash, not the raw token.
 */
export const hashRefreshToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Verify and decode an access token. Throws on invalid/expired.
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.accessSecret, {
    issuer: 'healthbridge',
    audience: 'healthbridge-client',
  });
};

/**
 * Compute expiry date for a refresh token.
 */
export const getRefreshTokenExpiry = () => {
  const days = parseInt(config.jwt.refreshExpiresIn?.replace('d', '') || '7', 10);
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
};
