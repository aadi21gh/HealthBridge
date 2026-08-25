/**
 * Creates a structured error with an HTTP status code.
 * Usage: throw createError(404, 'Patient not found')
 */
export const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

/**
 * Async route wrapper — eliminates try/catch boilerplate in controllers.
 * Usage: router.get('/path', asyncHandler(myController))
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Send a standardized success response.
 */
export const sendSuccess = (res, data, statusCode = 200, meta = {}) => {
  return res.status(statusCode).json({
    success: true,
    data,
    ...meta,
  });
};

/**
 * Send a paginated response.
 */
export const sendPaginated = (res, data, { page, limit, total }) => {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};
