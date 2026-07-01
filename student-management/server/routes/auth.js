const express = require('express');
const db = require('../db');
const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  if (username === 'admin') {
    if (password === 'admin123') {
      return res.json({ role: 'admin', user: { name: 'Administrator', rollNo: 'admin' } });
    }
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
  const student = db.prepare('SELECT id, rollNo, name, marks FROM students WHERE rollNo = ? AND password = ?').get(username, password);
  if (student) {
    return res.json({ role: 'student', user: student });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

module.exports = router;
