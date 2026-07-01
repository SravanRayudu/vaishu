const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const { date, studentId } = req.query;
  if (date) {
    const records = db.prepare(`
      SELECT a.id, a.studentId, s.rollNo, s.name, a.date, a.status
      FROM attendance a
      JOIN students s ON s.id = a.studentId
      WHERE a.date = ?
      ORDER BY s.rollNo ASC
    `).all(date);
    return res.json(records);
  }
  if (studentId) {
    const records = db.prepare(`
      SELECT a.id, a.date, a.status
      FROM attendance a
      WHERE a.studentId = ?
      ORDER BY a.date DESC
    `).all(studentId);
    return res.json(records);
  }
  res.json([]);
});

router.get('/stats/:studentId', (req, res) => {
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
      ROUND(CAST(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100, 1) as percentage
    FROM attendance
    WHERE studentId = ?
  `).get(req.params.studentId);
  res.json(stats);
});

router.post('/', (req, res) => {
  const { date, records } = req.body;
  if (!date || !records || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Date and records array required' });
  }
  const upsert = db.prepare(`
    INSERT INTO attendance (studentId, date, status)
    VALUES (?, ?, ?)
    ON CONFLICT(studentId, date) DO UPDATE SET status = excluded.status
  `);
  const transaction = db.transaction((data) => {
    for (const r of data) {
      upsert.run(r.studentId, date, r.status);
    }
  });
  transaction(records);
  res.json({ message: 'Attendance saved', count: records.length });
});

module.exports = router;
