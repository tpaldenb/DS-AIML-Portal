const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = (db) => {
    const router = express.Router();
    const JWT_SECRET = 'your-secret-key';

    // ✅ Signup Route
    router.post(
        '/signup',
        body('username').isLength({ min: 3 }).trim(),
        body('password').isLength({ min: 6 }),
        body('email').isEmail().optional({ nullable: true }).normalizeEmail(),

        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { firstName = null, lastName = null, phone = null, email = null, username, password } = req.body;

            try {
                // ✅ Check if username already exists
                const [rows] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
                if (rows.length) {
                    return res.json({ success: false, message: 'Username already exists.' });
                }

                // ✅ Hash password
                const hashedPassword = await bcrypt.hash(password, 10);

                // ✅ Insert user into DB
                await db.execute(
                    `INSERT INTO users (firstName, lastName, phone, email, username, password)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [firstName, lastName, phone, email, username, hashedPassword]
                );

                return res.json({ success: true, message: 'Signup successful!' });
            } catch (err) {
                console.error('Signup Error:', err.message);
                return res.status(500).json({ success: false, message: 'Signup failed: ' + err.message });
            }
        }
    );

    // ✅ Login Route
    router.post(
        '/login',
        body('username').notEmpty().trim(),
        body('password').notEmpty(),

        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { username, password } = req.body;

            try {
                const [rows] = await db.execute('SELECT id, username, password FROM users WHERE username = ?', [username]);
                if (rows.length === 0) {
                    return res.json({ success: false, message: 'User not found.' });
                }

                const user = rows[0];
                const match = await bcrypt.compare(password, user.password);
                if (!match) {
                    return res.json({ success: false, message: 'Invalid password.' });
                }

                // ✅ Create JWT Token
                const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

                return res.json({
                    success: true,
                    message: 'Login successful!',
                    token
                });
            } catch (err) {
                console.error('Login Error:', err.message);
                return res.status(500).json({ success: false, message: 'Login failed: ' + err.message });
            }
        }
    );

    return router;
};
