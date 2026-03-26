const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 1. Import all routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const adminRoutes = require('./routes/adminRoutes'); // <-- MAKE SURE THIS IS HERE

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 2. Register the routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/admins', adminRoutes); // <-- MAKE SURE THIS IS HERE

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});