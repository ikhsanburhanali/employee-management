const express = require('express');
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Get all admins
router.get('/', verifyToken, async (req, res) => {
    try {
        const [admins] = await db.query('SELECT id, username, is_online FROM administrators');
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admins' });
    }
});

// Get Dashboard Statistics
router.get('/stats', verifyToken, async (req, res) => {
    try {
        // 1. Total Employees
        const [empCount] = await db.query('SELECT COUNT(*) as total FROM employees');
        
        // 2. Online Admins
        const [adminCount] = await db.query('SELECT COUNT(*) as online FROM administrators WHERE is_online = 1');
        
        // 3. Department Distribution
        const [deptStats] = await db.query('SELECT department, COUNT(*) as count FROM employees GROUP BY department');
        
        // 4. Recently Added Employees (Last 5)
        const [recentEmployees] = await db.query('SELECT * FROM employees ORDER BY id DESC LIMIT 5');

        res.json({
            totalEmployees: empCount[0].total,
            onlineAdmins: adminCount[0].online,
            departments: deptStats,
            recentEmployees: recentEmployees
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
});

// Revoke Access (Force logout)
router.post('/:id/revoke', verifyToken, async (req, res) => {
    const adminId = req.params.id;
    try {
        // We set is_online to 0. 
        // In a real app, you might also clear a 'session_id' or 'token_version' here.
        await db.query('UPDATE administrators SET is_online = 0 WHERE id = ?', [adminId]);
        res.json({ message: 'Access revoked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error revoking access' });
    }
});

module.exports = router;