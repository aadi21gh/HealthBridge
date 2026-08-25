import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import config from './config/index.js';
import logger from './config/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import recordsRoutes from './routes/records.js';
import consentRoutes from './routes/consents.js';
import auditRoutes from './routes/audit.js';
import fhirRoutes from './routes/fhir.js';
import aiRoutes from './routes/ai.js';
import documentRoutes from './routes/documents.js';
import intakeRoutes from './routes/intake.js';
import kioskRoutes from './routes/kiosk.js';

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        config.env === 'development' ||
        origin === config.cors.clientUrl ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── MongoDB injection protection ──────────────────────────────────────────────
app.use(mongoSanitize());

// ── Compression ───────────────────────────────────────────────────────────────
app.use(compression());

// ── HTTP logging ──────────────────────────────────────────────────────────────
if (config.env !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );
}

// ── Global rate limiter ───────────────────────────────────────────────────────
app.use(
  '/api',
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    skip: () => config.env === 'test' || config.env === 'development',
    message: {
      success: false,
      error: { message: 'Too many requests. Please try again later.' },
    },
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ── Trust proxy (for accurate IP behind reverse proxy) ───────────────────────
app.set('trust proxy', 1);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: config.env });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/consents', consentRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/fhir', fhirRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/intake', intakeRoutes);
app.use('/api/kiosks', kioskRoutes);

// ── 404 & Error handling ──────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
