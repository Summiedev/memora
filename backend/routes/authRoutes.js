const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const passport = require('passport');
const { authLimiter, loginLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validator');
const { registerBody, loginBody, forgotPasswordBody, requestPasswordResetBody, resetPasswordBody, updateProfileBody, updatePasswordBody, authParams } = require('../utils/schemas');
const router = express.Router();

router.post('/register', authLimiter, validate('body', registerBody), authController.register);
router.post('/login', loginLimiter, validate('body', loginBody), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', passwordResetLimiter, validate('body', forgotPasswordBody), authController.forgotPassword);
router.get('/verify-email', authController.verifyEmail);

router.get('/profile', authMiddleware, authController.getUserProfile);
router.patch('/profile', authMiddleware, validate('body', updateProfileBody), authController.updateProfile);
router.get('/details', authMiddleware, authController.getUserDetails);

router.patch('/update-password', authMiddleware, validate('body', updatePasswordBody), authController.updatePassword);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: false,
}), authController.googleAuthSuccess);

router.post('/requestPasswordReset', passwordResetLimiter, validate('body', requestPasswordResetBody), authController.requestPasswordReset);

router.post('/resetPassword/:id/:token', validate('params', authParams), validate('body', resetPasswordBody), authController.resetPassword);

module.exports = router;
