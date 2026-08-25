import app from './app.js';
import { connectDB } from './config/database.js';
import config from './config/index.js';
import logger from './config/logger.js';

const start = async () => {
  try {
    await connectDB();

    // Auto-seed database if no users exist (especially for in-memory MongoDB)
    const User = (await import('./models/User.js')).default;
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      logger.info('Database empty — running automatic seed for demo data...');
      const { seedData } = await import('./scripts/seed.js');
      await seedData();
    }

    const server = app.listen(config.port, () => {
      logger.info(`HealthBridge server running on port ${config.port} [${config.env}]`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        const { disconnectDB } = await import('./config/database.js');
        await disconnectDB();
        logger.info('Server shut down cleanly');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Unhandled rejections
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled rejection', { reason });
    });
  } catch (err) {
    logger.error('Failed to start server', { err });
    process.exit(1);
  }
};

start();
