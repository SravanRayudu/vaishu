const express = require('express');
const data = require('./data');

const app = express();

app.use(express.json());

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Auth
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  if (username === 'admin' && password === 'admin123') {
    return res.json({ role: 'admin', user: { name: 'Administrator', rollNo: 'admin' } });
  }
  const student = data.authStudent(username, password);
  if (student) return res.json({ role: 'student', user: student });
  return res.status(401).json({ error: 'Invalid credentials' });
});

// Students
app.get('/api/students', (req, res) => res.json(data.getAllStudents()));

app.get('/api/students/:id', (req, res) => {
  const student = data.getStudentById(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

app.post('/api/students', (req, res) => {
  const { rollNo, name, marks } = req.body;
  if (!rollNo || !name || marks === undefined) return res.status(400).json({ error: 'All fields required' });
  if (data.getStudentByRollNo(rollNo)) return res.status(409).json({ error: 'Roll number already exists' });
  const student = data.addStudent({ rollNo, name, marks });
  res.status(201).json(student);
});

app.put('/api/students/:id', (req, res) => {
  const { rollNo, name, marks } = req.body;
  const existing = data.getStudentById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Student not found' });
  const dup = data.getStudentByRollNo(rollNo);
  if (dup && dup.id !== Number(req.params.id)) return res.status(409).json({ error: 'Roll number already in use' });
  const student = data.updateStudent(req.params.id, { rollNo, name, marks });
  res.json(student);
});

app.delete('/api/students/:id', (req, res) => {
  const ok = data.deleteStudent(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Student not found' });
  res.json({ message: 'Student deleted' });
});

app.get('/api/students/stats/summary', (req, res) => res.json(data.getStats()));

// Attendance
app.get('/api/attendance', (req, res) => {
  const { date, studentId } = req.query;
  if (date) return res.json(data.getAttendanceByDate(date));
  if (studentId) return res.json(data.getAttendanceByStudent(studentId));
  res.json([]);
});

app.get('/api/attendance/stats/:studentId', (req, res) => res.json(data.getAttendanceStats(req.params.studentId)));

app.post('/api/attendance', (req, res) => {
  const { date, records } = req.body;
  if (!date || !records || !Array.isArray(records)) return res.status(400).json({ error: 'Date and records array required' });
  const count = data.saveAttendance(date, records);
  res.json({ message: 'Attendance saved', count });
});

// Catch-all for API 404s
app.use('/api', (req, res) => res.status(404).json({ error: 'API endpoint not found' }));

module.exports = app;
