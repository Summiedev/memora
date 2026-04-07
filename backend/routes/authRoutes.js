const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/authController'); // Using require for named imports
const passport = require('passport');
const csrf = require('csurf');
const router = express.Router();

// CSRF protection middleware for POST requests
const isDev = process.env.NODE_ENV !== 'production';
const csrfProtection = (req, res, next) => {
  if (isDev) {
    console.log('🔓 CSRF validation skipped (development mode)');
    return next();
  }
  
  // Production: Use Lax instead of Strict for better mobile support
  const expressCSRF = csrf({ 
    cookie: { 
      httpOnly: true, 
      sameSite: 'Lax',  // Better mobile browser support than Strict or None
      secure: process.env.HTTPS === 'true' || process.env.NODE_ENV === 'production'
    } 
  });
  
  expressCSRF(req, res, (err) => {
    if (err) {
      console.log('❌ CSRF validation failed:', err.message);
      console.log('   Received:', req.headers['x-csrf-token']);
      console.log('   Cookie:', req.cookies._csrf);
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    next();
  });
};

router.post('/register', csrfProtection, authController.register);
router.post('/login', csrfProtection, authController.login);
router.post('/refresh', csrfProtection, authController.refresh);
router.post('/logout', csrfProtection, authController.logout);
router.post('/forgot-password', csrfProtection, authController.forgotPassword);
router.get('/verify-email', authController.verifyEmail);

router.get('/profile', authMiddleware, authController.getUserProfile);
router.patch('/profile', authMiddleware, authController.updateProfile);
router.get('/details', authMiddleware, authController.getUserDetails);


// router.post('/register', authController.register);
// router.post('/login', authController.login);
// router.post('/forgot-password', authController.forgotPassword);
router.patch('/update-password', authController.updatePassword);
// router.post('/logout', authMiddleware, authController.logout);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback route after successful login
router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: false,
}), authController.googleAuthSuccess);

// Route to request password reset
router.post('/requestPasswordReset', authController.requestPasswordReset);

// Route to reset password
router.post('/resetPassword/:id/:token', authController.resetPassword);

module.exports = router;