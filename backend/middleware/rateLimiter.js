const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

const requestIpKey = (req) => ipKeyGenerator(req.ip);

const createRateLimiter = (windowMs, max, message, keyGenerator) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: keyGenerator || requestIpKey,
    skip: (req) => process.env.NODE_ENV === 'test',
  });
};

const authLimiter = createRateLimiter(
  15 * 60 * 1000,
  5,
  'Too many requests, please try again later',
  requestIpKey
);

const loginLimiter = createRateLimiter(
  15 * 60 * 1000,
  10,
  'Too many login attempts, please try again later',
  requestIpKey
);

const passwordResetLimiter = createRateLimiter(
  60 * 60 * 1000,
  3,
  'Too many password reset requests, please try again later',
  requestIpKey
);

const pinLimiter = createRateLimiter(
  60 * 1000,
  5,
  'Too many PIN attempts, please try again later',
  requestIpKey
);

const globalApiLimiter = createRateLimiter(
  15 * 60 * 1000,
  1000,
  'Too many requests, please try again later',
  (req) => req.user?._id?.toString() || requestIpKey(req)
);

module.exports = {
  authLimiter,
  loginLimiter,
  passwordResetLimiter,
  pinLimiter,
  globalApiLimiter,
};
