const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ✅ Import modular routes
const authRoutes = require('./authRoutes');
const projectsRoutes = require('./projectsRoutes');

async function startServer() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'newpassword',
        database: 'ds_aiml_portal'
    });
    console.log('✅ MySQL Connected');

    // ✅ Mount routes
    app.use('/auth', authRoutes(db)); // For login/signup
    app.use('/projects', projectsRoutes(db)); // For projects feature

    // ✅ Serve frontend pages
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    app.listen(5001, () => console.log('✅ Server running on http://localhost:5001'));
}

startServer();
