const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // ✅ Get all projects
    router.get('/', async (req, res) => {
        try {
            const [rows] = await db.execute('SELECT * FROM projects');
            res.json(rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // ✅ Add a new project
    router.post('/', async (req, res) => {
        const { project_name, domain, guide, student_id } = req.body;
        try {
            await db.execute(
                'INSERT INTO projects (project_name, domain, guide, student_id, status) VALUES (?, ?, ?, ?, "Pending")',
                [project_name, domain, guide, student_id]
            );
            res.json({ message: 'Project submitted successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // ✅ Approve project
    router.put('/:id/approve', async (req, res) => {
        const { id } = req.params;
        try {
            await db.execute('UPDATE projects SET status = "Approved" WHERE id = ?', [id]);
            res.json({ message: 'Project approved' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // ✅ Reject project
    router.put('/:id/reject', async (req, res) => {
        const { id } = req.params;
        try {
            await db.execute('UPDATE projects SET status = "Rejected" WHERE id = ?', [id]);
            res.json({ message: 'Project rejected' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
};
