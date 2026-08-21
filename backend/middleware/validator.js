const { validationResult } = require('express-validator');
const { ZodError } = require('zod');
const logger = require('./logger');

const validate = (source, schema) => {
  return (req, res, next) => {
    let data;
    switch (source) {
      case 'body':
        data = req.body;
        break;
      case 'params':
        data = req.params;
        break;
      case 'query':
        data = req.query;
        break;
      case 'headers':
        data = req.headers;
        break;
      default:
        return next(new Error(`Invalid validation source: ${source}`));
    }

    try {
      const validated = schema.parse(data);
      switch (source) {
        case 'body':
          req.body = validated;
          break;
        case 'params':
          req.params = validated;
          break;
        case 'query':
          req.query = validated;
          break;
        case 'headers':
          req.headers = validated;
          break;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        logger.warn({ validationErrors: errors }, 'Validation failed');
        return res.status(400).json({
          error: 'Validation failed',
          details: errors,
        });
      }
      logger.error(error, 'Unexpected validation error');
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

module.exports = { validate };
