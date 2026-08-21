const pino = require('pino');
const crypto = require('crypto');

const isProduction = process.env.NODE_ENV === 'production';

const sensitiveFields = [
  'password',
  'passwordHash',
  'pin',
  'pinHash',
  'accessToken',
  'refreshToken',
  'token',
  'secret',
  'apiKey',
  'api_secret',
  'CLOUDINARY_API_SECRET',
  'JWT_SECRET',
  'APP_PASS',
  'sessionId',
  'cookie',
  'authorization',
  'csrfToken',
  'resetURL',
];

const redactSensitiveData = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const redacted = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveFields.some(field => key.toLowerCase() === field.toLowerCase())) {
      redacted[key] = '[REDACTED]';
    } else if (value !== null && typeof value === 'object') {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
};

const transport = !isProduction
  ? pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    })
  : undefined;

const logger = pino(
  {
    level: isProduction ? 'info' : 'debug',
    format: {
      timestamp: () => `,"time":"${new Date().toISOString()}"`,
    },
    redact: ['req.headers.authorization', 'req.headers.cookie', 'req.body.password', 'req.body.pin', 'req.body.accessToken', 'req.body.refreshToken', 'res.headers.authorization', 'res.headers["set-cookie"]'],
    base: {
      env: process.env.NODE_ENV,
      service: 'memora-api',
      version: process.env.npm_package_version || '1.0.0',
    },
    mixin(mergeInfo) {
      return {
        requestId: mergeInfo.req?.id || crypto.randomUUID(),
        correlationId: mergeInfo.req?.correlationId || mergeInfo.req?.id || crypto.randomUUID(),
        errorId: mergeInfo.err?.id || mergeInfo.req?.errorId || undefined,
      };
    },
  },
  transport
);

module.exports = logger;
