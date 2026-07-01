const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'students.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rollNo TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    marks REAL NOT NULL,
    password TEXT NOT NULL DEFAULT 'student123',
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId INTEGER NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('present','absent')),
    markedBy TEXT DEFAULT 'admin',
    UNIQUE(studentId, date),
    FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
  );
`);

const count = db.prepare('SELECT COUNT(*) as count FROM students').get();
if (count.count === 0) {
  const insertStudent = db.prepare('INSERT INTO students (rollNo, name, marks, password) VALUES (?, ?, ?, ?)');
  const students = [
    ['101', 'Alice Johnson', 85, 'student123'],
    ['102', 'Bob Smith', 32, 'student123'],
    ['103', 'Carol Williams', 58, 'student123'],
    ['104', 'David Brown', 91, 'student123'],
    ['105', 'Eva Davis', 24, 'student123'],
  ];
  const insertMany = db.transaction((data) => {
    for (const s of data) insertStudent.run(...s);
  });
  insertMany(students);

  const insertAttendance = db.prepare('INSERT OR IGNORE INTO attendance (studentId, date, status) VALUES (?, ?, ?)');
  const dates = [];
  const today = new Date();
  for (let i = 9; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      dates.push(d.toISOString().split('T')[0]);
    }
  }
  const allStudents = db.prepare('SELECT id FROM students').all();
  const attData = [];
  for (const student of allStudents) {
    for (const date of dates) {
      const present = Math.random() > 0.2;
      attData.push([student.id, date, present ? 'present' : 'absent']);
    }
  }
  const insertAttMany = db.transaction((data) => {
    for (const a of data) insertAttendance.run(...a);
  });
  insertAttMany(attData);
}

module.exports = db;
