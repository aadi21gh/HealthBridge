import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { registerSchema, loginSchema, validate } from '../validators/authValidators.js';
import config from '../config/index.js';

const router = Router();

// Rate limiter for auth endpoints (skipped in test and development)
const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMax,
  skip: () => config.env === 'test' || config.env === 'development',
  message: {
    success: false,
    error: { message: 'Too many authentication attempts. Please try again later.' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/register
router.post('/register', authLimiter, validate(registerSchema), authController.register);

// POST /api/auth/login
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// POST /api/auth/refresh
router.post('/refresh', authController.refresh);

// POST /api/auth/logout
router.post('/logout', authenticate, authController.logout);

// GET /api/auth/me
router.get('/me', authenticate, authController.getMe);

export default router;
