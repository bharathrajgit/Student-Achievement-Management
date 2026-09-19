import Joi from 'joi';
import { logger } from '../utils/logger.js';

/**
 * DTO Validation Middleware
 * Validates request body against schema
 */
export const validateDTO = (schema) => {
  return (req, res, next) => {
    try {
      // Validate using Joi
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      // If validation failed
      if (error) {
        const messages = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

        logger.warn(`Validation failed: ${JSON.stringify(messages)}`);

        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: messages,
        });
      }

      // Attach validated data to request
      req.validatedBody = value;
      
      // Call next middleware
      next();
    } catch (error) {
      logger.error('DTO validation error:', error.message);
      
      return res.status(500).json({
        status: 'error',
        message: 'Validation error',
        details: error.message,
      });
    }
  };
};
