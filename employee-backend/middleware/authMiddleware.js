const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const verifyToken = async (req, res, next) => {
    // 1. Get the token from the Authorization header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // The header looks like: "Bearer eyJhbGciOiJIUzI1NiIsInR5c..."
        // We split by space and take the second part (the actual token)
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // 2. Verify the token's cryptographic signature
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Database Check: Enforce the "Revoke Access" feature
        // We query the DB to ensure the admin is still online and the token matches
        const [admins] = await db.query(
            'SELECT id, username, is_online, session_token FROM administrators WHERE id = ?',
            [decoded.id]
        );

        if (admins.length === 0) {
            return res.status(401).json({ message: 'Invalid token. User no longer exists.' });
        }

        const admin = admins[0];

        // If another admin clicked "revoke", is_online will be false or session_token will be NULL
        if (!admin.is_online || admin.session_token !== token) {
            return res.status(401).json({ message: 'Session expired or access revoked. Please log in again.' });
        }

        // 4. Attach admin details to the request object for the upcoming routes to use
        req.admin = admin; 
        
        // 5. Pass control to the next middleware or the actual route controller
        next(); 
    } catch (error) {
        // If the token is expired or tampered with, jwt.verify throws an error
        console.error('Auth middleware error:', error.message);
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = { verifyToken };