const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

router.get('/', verifyToken, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 15;
    const offset = (page - 1) * limit;

    try {
        const [employees] = await db.query(
            'SELECT * FROM employees ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );
        const [totalRows] = await db.query('SELECT COUNT(*) as count FROM employees');
        const totalEmployees = totalRows[0].count;

        res.json({
            data: employees,
            currentPage: page,
            totalPages: Math.ceil(totalEmployees / limit),
            totalEmployees
        });
    } catch (error) {
        console.error('Fetch employees error:', error);
        res.status(500).json({ message: 'Error fetching employees' });
    }
});

router.post('/', verifyToken, upload.single('photo'), async (req, res) => {
    const {
        first_name, last_name, address, phone_number,
        birth_date, birth_place, education, position,
        department, grade, joined_date
    } = req.body;
    const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const [result] = await db.query(
            `INSERT INTO employees 
            (photo_url, first_name, last_name, address, phone_number, birth_date, birth_place, education, position, department, grade, joined_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [photo_url, first_name, last_name, address, phone_number, birth_date, birth_place, education, position, department, grade, joined_date]
        );
        res.status(201).json({ message: 'Employee added successfully', id: result.insertId });
    } catch (error) {
        console.error('Add employee error:', error);
        res.status(500).json({ message: 'Error adding employee' });
    }
});

router.put('/:id', verifyToken, upload.single('photo'), async (req, res) => {
    const employeeId = req.params.id;
    const updateFields = req.body;

    try {
        const [existing] = await db.query('SELECT photo_url FROM employees WHERE id = ?', [employeeId]);
        if (existing.length === 0) return res.status(404).json({ message: 'Employee not found' });

        let newPhotoUrl = existing[0].photo_url;
        if (req.file) {
            newPhotoUrl = `/uploads/${req.file.filename}`;
            if (existing[0].photo_url) {
                const oldPath = path.join(__dirname, '..', existing[0].photo_url);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
        }

        const fieldsToUpdate = { ...updateFields, photo_url: newPhotoUrl };
        const setClause = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(fieldsToUpdate), employeeId];

        await db.query(`UPDATE employees SET ${setClause} WHERE id = ?`, values);
        res.json({ message: 'Employee updated successfully' });
    } catch (error) {
        console.error('Update employee error:', error);
        res.status(500).json({ message: 'Error updating employee' });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    const employeeId = req.params.id;
    try {
        const [existing] = await db.query('SELECT photo_url FROM employees WHERE id = ?', [employeeId]);
        if (existing.length === 0) return res.status(404).json({ message: 'Employee not found' });

        await db.query('DELETE FROM employees WHERE id = ?', [employeeId]);

        if (existing[0].photo_url) {
            const filePath = path.join(__dirname, '..', existing[0].photo_url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Delete employee error:', error);
        res.status(500).json({ message: 'Error deleting employee' });
    }
});

module.exports = router;