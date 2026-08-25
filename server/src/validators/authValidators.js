import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email({ tlds: false }).lowercase().required(),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    }),
  role: Joi.string()
    .valid('PATIENT', 'DOCTOR', 'HOSPITAL_ADMIN')
    .required()
    .messages({
      'any.only': 'Role must be one of: PATIENT, DOCTOR, HOSPITAL_ADMIN',
    }),
  firstName: Joi.string().trim().min(1).max(100).required(),
  lastName: Joi.string().trim().min(1).max(100).required(),
  phone: Joi.string()
    .pattern(/^\+?[0-9]{10,15}$/)
    .optional()
    .messages({ 'string.pattern.base': 'Invalid phone number format' }),
  // Doctor & hospital admin extras
  organizationId: Joi.when('role', {
    is: Joi.string().valid('DOCTOR', 'HOSPITAL_ADMIN'),
    then: Joi.string().optional(),
    otherwise: Joi.forbidden(),
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: false }).lowercase().required(),
  password: Joi.string().required(),
});

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

/**
 * Validate request body against a Joi schema.
 * Returns { error, value } — Joi standard.
 */
export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: error.details.map((d) => ({ field: d.path.join('.'), message: d.message })),
      },
    });
  }
  req.body = value;
  next();
};
