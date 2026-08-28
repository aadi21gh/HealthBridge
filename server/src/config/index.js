import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from workspace root and server directory
dotenv.config({ path: join(__dirname, '../../../.env') });
dotenv.config({ path: join(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),

  db: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/healthbridge',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'healthbridge_dev_jwt_access_secret_super_secure_key_1234567890',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'healthbridge_dev_jwt_refresh_secret_super_secure_key_1234567890',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  cors: {
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  },

  storage: {
    strategy: process.env.STORAGE_STRATEGY || 'local',
    localPath: process.env.STORAGE_LOCAL_PATH || './uploads',
    s3: {
      endpoint: process.env.S3_ENDPOINT,
      accessKey: process.env.S3_ACCESS_KEY,
      secretKey: process.env.S3_SECRET_KEY,
      bucketName: process.env.S3_BUCKET_NAME || 'healthbridge-documents',
      region: process.env.S3_REGION || 'ap-south-1',
    },
  },

  ai: {
    provider: process.env.AI_PROVIDER || 'mock',
    openaiApiKey: process.env.OPENAI_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    sarvamApiKey: process.env.SARVAM_API_KEY,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10),
  },

  cookie: {
    secret: process.env.COOKIE_SECRET,
  },

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  },

  log: {
    level: process.env.LOG_LEVEL || 'info',
  },

  kiosk: {
    sessionTimeoutMinutes: parseInt(process.env.KIOSK_SESSION_TIMEOUT_MINUTES || '30', 10),
    maxDocumentsPerSession: parseInt(process.env.KIOSK_MAX_DOCUMENTS || '10', 10),
    defaultLanguage: process.env.KIOSK_DEFAULT_LANGUAGE || 'en',
    autoAbandonMinutes: parseInt(process.env.KIOSK_AUTO_ABANDON_MINUTES || '60', 10),
  },
};

// Validate required secrets in production
if (config.env === 'production') {
  const required = [
    'jwt.accessSecret',
    'jwt.refreshSecret',
    'cookie.secret',
  ];
  const missing = required.filter((key) => {
    const parts = key.split('.');
    let val = config;
    for (const part of parts) val = val[part];
    return !val;
  });
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}

export default config;
