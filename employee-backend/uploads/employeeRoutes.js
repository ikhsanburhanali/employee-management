const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware'); // Our gatekeeper

const router = express.Router();

// --- MULTER CONFIGURATION FOR PHOTO UPLOADS ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save files in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        // Create a unique filename: timestamp + original extension
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// --- 1. GET ALL EMPLOYEES (WITH PAGINATION) ---
router.get('/', verifyToken, async (req, res) => {
    // Pagination logic: default to page 1, 15 items per page
    const page = parseInt(req.query.page) || 1;
    const limit = 15;
    const offset = (page - 1) * limit;

    try {
        // Fetch employees for the current page
        const [employees] = await db.query(
            'SELECT * FROM employees ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );

        // Fetch total count to tell the frontend how many pages there are
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

// --- 2. ADD NEW EMPLOYEE ---
// 'photo' matches the field name we will use in our React FormData
router.post('/', verifyToken, upload.single('photo'), async (req, res) => {
    const {
        first_name, last_name, address, phone_number,
        birth_date, birth_place, education, position,
        department, grade, joined_date
    } = req.body;

    // If a file was uploaded, save its path; otherwise, null
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

// --- 3. EDIT EMPLOYEE ---
router.put('/:id', verifyToken, upload.single('photo'), async (req, res) => {
    const employeeId = req.params.id;
    const updateFields = req.body;

    try {
        // First, check if the employee exists and get their old photo
        const [existing] = await db.query('SELECT photo_url FROM employees WHERE id = ?', [employeeId]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Handle photo update: if a new file is uploaded, use it and delete the old one
        let newPhotoUrl = existing[0].photo_url;
        if (req.file) {
            newPhotoUrl = `/uploads/${req.file.filename}`;
            // Remove old photo from server to save space
            if (existing[0].photo_url) {
                const oldPath = path.join(__dirname, '..', existing[0].photo_url);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
        }

        // Dynamically build the UPDATE query based on what fields were sent
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

// --- 4. DELETE EMPLOYEE ---
router.delete('/:id', verifyToken, async (req, res) => {
    const employeeId = req.params.id;

    try {
        // Fetch employee first to get the photo URL
        const [existing] = await db.query('SELECT photo_url FROM employees WHERE id = ?', [employeeId]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Delete from database
        await db.query('DELETE FROM employees WHERE id = ?', [employeeId]);

        // Delete photo file from the server
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