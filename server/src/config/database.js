import mongoose from 'mongoose';
import config from './index.js';
import logger from './logger.js';

let isConnected = false;
let mongod = null;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(config.db.uri, {
      serverSelectionTimeoutMS: 4000,
    });

    isConnected = true;
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    if (config.env === 'development' || config.env === 'test') {
      logger.warn(`Could not connect to ${config.db.uri}, starting in-memory MongoDB server...`);
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        const conn = await mongoose.connect(uri);
        isConnected = true;
        logger.info(`In-memory MongoDB connected: ${conn.connection.host}`);
      } catch (memErr) {
        logger.error('Failed to start in-memory MongoDB', { memErr });
        throw memErr;
      }
    } else {
      logger.error('MongoDB connection failed', { err });
      throw err;
    }
  }

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB error', { err });
  });
};

export const disconnectDB = async () => {
  if (!isConnected) return;
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
  isConnected = false;
  logger.info('MongoDB disconnected gracefully');
};

export default connectDB;
