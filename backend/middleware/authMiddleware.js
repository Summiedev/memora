
const jwt = require('jsonwebtoken');
const User = require('../models/user.js'); // Adjust the path as necessary


const authenticateUser = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        console.log('🔍 Auth check - accessToken cookie:', !!token ? 'present' : 'missing');
        if (!token) {
            console.log('❌ No access token in cookies');
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            console.log('❌ Invalid user ID from token');
            return res.status(401).json({ error: 'Invalid token.' });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ error: 'Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired.' });
        }
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = authenticateUser;
