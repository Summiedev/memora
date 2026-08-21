
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');

const authenticateUser = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
          algorithms: ['HS256']
        });

        if (decoded.v !== undefined) {
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(401).json({ error: 'Invalid token.' });
            }
            if (decoded.v !== user.tokenVersion) {
                return res.status(401).json({ error: 'Token has been revoked.' });
            }
            req.user = user;
            next();
            return;
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'Invalid token.' });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired.' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = authenticateUser;
