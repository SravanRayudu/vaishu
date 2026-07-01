const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const students = db.prepare('SELECT id, rollNo, name, marks, createdAt FROM students ORDER BY rollNo ASC').all();
  res.json(students);
});

router.get('/:id', (req, res) => {
  const student = db.prepare('SELECT id, rollNo, name, marks, createdAt FROM students WHERE id = ?').get(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

router.post('/', (req, res) => {
  const { rollNo, name, marks } = req.body;
  if (!rollNo || !name || marks === undefined) {
    return res.status(400).json({ error: 'All fields required' });
  }
  const existing = db.prepare('SELECT id FROM students WHERE rollNo = ?').get(rollNo);
  if (existing) {
    return res.status(409).json({ error: 'Roll number already exists' });
  }
  const result = db.prepare('INSERT INTO students (rollNo, name, marks) VALUES (?, ?, ?)').run(rollNo, name, marks);
  const student = db.prepare('SELECT id, rollNo, name, marks, createdAt FROM students WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(student);
});

router.put('/:id', (req, res) => {
  const { rollNo, name, marks } = req.body;
  const existing = db.prepare('SELECT id FROM students WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Student not found' });
  const dup = db.prepare('SELECT id FROM students WHERE rollNo = ? AND id != ?').get(rollNo, req.params.id);
  if (dup) return res.status(409).json({ error: 'Roll number already in use' });
  db.prepare('UPDATE students SET rollNo = ?, name = ?, marks = ? WHERE id = ?').run(rollNo, name, marks, req.params.id);
  const student = db.prepare('SELECT id, rollNo, name, marks, createdAt FROM students WHERE id = ?').get(req.params.id);
  res.json(student);
});

router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM students WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Student not found' });
  db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
  res.json({ message: 'Student deleted' });
});

router.get('/stats/summary', (req, res) => {
  const stats = db.prepare(`
    SELECT
      COUNT(*) as totalStudents,
      ROUND(AVG(marks), 1) as averageMarks,
      SUM(CASE WHEN marks >= 35 THEN 1 ELSE 0 END) as passed,
      SUM(CASE WHEN marks < 35 THEN 1 ELSE 0 END) as failed,
      ROUND(CAST(SUM(CASE WHEN marks >= 35 THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100, 1) as passPercentage
    FROM students
  `).get();

  const attendanceStats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
      ROUND(CAST(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100, 1) as attendancePercentage
    FROM attendance
  `).get();

  res.json({ ...stats, ...attendanceStats });
});

module.exports = router;
