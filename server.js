const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3000;

// ✅ Connect to MySQL
let db;
(async () => {
    db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',    // Change this to your MySQL username
        password: 'newpassword',    // Change this to your MySQL password
        database: 'ds_aiml_portal'
    });
    console.log('✅ MySQL Connected...');
})();

// ✅ SIGNUP ROUTE
app.post('/signup', async (req, res) => {
    const { firstName, lastName, phone, email, username, password } = req.body;

    try {
        // Check if username exists
        const [existingUser] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.json({ success: false, message: 'Username already exists.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        await db.execute(
            'INSERT INTO users (firstName, lastName, phone, email, username, password) VALUES (?, ?, ?, ?, ?, ?)',
            [firstName, lastName, phone, email, username, hashedPassword]
        );

        res.json({ success: true, message: 'Signup successful!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ✅ LOGIN ROUTE
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length === 0) {
            return res.json({ success: false, message: 'User not found.' });
        }

        const user = rows[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid password.' });
        }

        res.json({ success: true, message: 'Login successful!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
