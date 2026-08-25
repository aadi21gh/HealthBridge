import logger from '../config/logger.js';

/**
 * Global error handling middleware.
 * Must be registered last in Express middleware stack.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Log server errors
  if (status >= 500) {
    logger.error('Unhandled server error', {
      err: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Never expose stack traces in production
  const response = {
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: Object.values(err.errors).map((e) => ({
          field: e.path,
          message: e.message,
        })),
      },
    });
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    return res.status(409).json({
      success: false,
      error: { message: `Duplicate value for ${field}` },
    });
  }

  return res.status(status).json(response);
};

/**
 * 404 handler — catches unmatched routes.
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: { message: `Route ${req.method} ${req.path} not found` },
  });
};
