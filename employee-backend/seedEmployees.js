// seedEmployees.js
const db = require('./config/db');

const firstNames = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "William", "Elizabeth"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
const positions = ["Software Engineer", "HR Specialist", "Marketing Manager", "Accountant", "UX Designer", "Sales Lead"];
const departments = ["IT", "Human Resources", "Marketing", "Finance", "Product", "Sales"];
const grades = ["staff", "supervisor", "manager", "vp", "c_level"];

async function seed() {
    console.log("Starting seed process...");
    for (let i = 1; i <= 50; i++) {
        const fname = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lname = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        const employee = [
            `https://i.pravatar.cc/150?u=${i}`, // Random Photo
            fname,
            lname,
            `${Math.floor(Math.random() * 999)} Oak Street, Springfield`,
            `555-010${i}`,
            "1990-01-01",
            "Chicago",
            "Bachelor Degree",
            positions[Math.floor(Math.random() * positions.length)],
            departments[Math.floor(Math.random() * departments.length)],
            grades[Math.floor(Math.random() * grades.length)],
            "2023-01-15"
        ];

        try {
            await db.query(
                `INSERT INTO employees 
                (photo_url, first_name, last_name, address, phone_number, birth_date, birth_place, education, position, department, grade, joined_date) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                employee
            );
        } catch (err) {
            console.error("Error inserting record:", err.message);
        }
    }
    console.log("Successfully seeded 50 employees!");
    process.exit();
}

seed();