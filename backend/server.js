const express  = require('express');
const http     = require('http');
const dotenv   = require('dotenv');
const cors     = require('cors');
const passport = require('passport');
const cloudinary = require('cloudinary').v2;
const cookieParser = require('cookie-parser');
const compression = require('compression');
const helmet = require('helmet');
const crypto = require('crypto');
const { initSocket } = require('./config/socket');
const {
  requestId,
  trustProxy,
  sanitizeData,
  disablePoweredBy,
  securityHeaders,
} = require('./middleware/security');
const { globalApiLimiter } = require('./middleware/rateLimiter');

dotenv.config();

const requiredEnvVars = [
  'NODE_ENV',
  'MONGO_URI',
  'JWT_SECRET',
  'CLIENT_URL',
  'SERVER_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'EMAIL_USER',
  'APP_PASS',
];

const missing = requiredEnvVars.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET must be at least 32 characters');
  process.exit(1);
}

// Connect to MongoDB
const { connectDB } = require('./config/db');
connectDB();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Passport strategies
require('./config/passport');

const app    = express();
const server = http.createServer(app);

// Trust proxy (important behind Nginx/Cloudflare)
trustProxy(app);

// Security middleware
app.use(requestId);
app.use(disablePoweredBy);
app.use(securityHeaders);
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// NoSQL injection prevention
app.use(sanitizeData());

// CORS
app.use(cors({
  origin: (origin, callback) => {
    const isDev = process.env.NODE_ENV !== 'production';
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CLIENT_URL,
    ].filter(Boolean);

    if (isDev) {
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('192.168')) {
        callback(null, true);
        return;
      }
    }

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      if (process.env.NODE_ENV === 'production') {
        callback(new Error('Not allowed by CORS'));
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Compression
app.use(compression());

// Passport
app.use(passport.initialize());

// CSRF Token endpoint
app.get('/api/csrf-token', (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('_csrf', token, {
    httpOnly: false,
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3600000,
    path: '/',
  });
  res.json({ csrfToken: token });
});

const csrfProtection = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const method = req.method.toLowerCase();
  if (['get', 'head', 'options'].includes(method)) {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] || req.body?._csrf;
  const csrfCookie = req.cookies?._csrf;

  if (!csrfToken || !csrfCookie || csrfToken !== csrfCookie) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
};

app.use(csrfProtection);

// Global rate limit (authenticated routes use user ID, unauthenticated use IP)
app.use('/api', globalApiLimiter);

app.use('/api', require('./routes'));

app.use(require('./middleware/errorHandler'));

// Initialize Socket.IO
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server with Socket.IO running on port ${PORT}`));
