// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();

// --- LOGIN ENDPOINT ---
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Find administrator by username
        const [admins] = await db.query('SELECT * FROM administrators WHERE username = ?', [username]);
        
        if (admins.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const admin = admins[0];

        // 2. Compare the provided password with the hashed password in the DB
        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // 3. Generate a JWT token
        const token = jwt.sign(
            { id: admin.id, username: admin.username }, 
            process.env.JWT_SECRET, 
            { expiresIn: '8h' } // Token expires in 8 hours
        );

        // 4. Update the database to show the admin is online and store the token
        await db.query(
            'UPDATE administrators SET is_online = TRUE, session_token = ? WHERE id = ?',
            [token, admin.id]
        );

        // 5. Send success response
        res.json({
            message: 'Login successful',
            token,
            admin: { id: admin.id, username: admin.username }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// --- LOGOUT ENDPOINT ---
router.post('/logout', async (req, res) => {
    const { adminId } = req.body; // In a real app, you'd extract this from the JWT middleware

    try {
        await db.query(
            'UPDATE administrators SET is_online = FALSE, session_token = NULL WHERE id = ?',
            [adminId]
        );
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;