const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/authController'); // Using require for named imports
const passport = require('passport');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/logout', authMiddleware, authController.logout);
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