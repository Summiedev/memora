const crypto = require('crypto');
const mongoSanitize = require('express-mongo-sanitize');

const requestId = (req, res, next) => {
  const id = crypto.randomUUID();
  req.id = id;
  res.setHeader('X-Request-ID', id);
  next();
};

const trustProxy = (app) => {
  app.set('trust proxy', 1);
};

const sanitizeData = () => {
  return mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      if (process.env.NODE_ENV === 'production') {
        console.warn(`[SECURITY] Blocked NoSQL injection attempt in ${key} from IP ${req.ip}`);
      }
    },
  });
};

const disablePoweredBy = (req, res, next) => {
  res.removeHeader('X-Powered-By');
  next();
};

const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
};

module.exports = {
  requestId,
  trustProxy,
  sanitizeData,
  disablePoweredBy,
  securityHeaders,
};
