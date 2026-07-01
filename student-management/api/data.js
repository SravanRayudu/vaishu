const students = [
  { id: 1, rollNo: '101', name: 'Alice Johnson', marks: 85, password: 'student123', createdAt: new Date().toISOString() },
  { id: 2, rollNo: '102', name: 'Bob Smith', marks: 32, password: 'student123', createdAt: new Date().toISOString() },
  { id: 3, rollNo: '103', name: 'Carol Williams', marks: 58, password: 'student123', createdAt: new Date().toISOString() },
  { id: 4, rollNo: '104', name: 'David Brown', marks: 91, password: 'student123', createdAt: new Date().toISOString() },
  { id: 5, rollNo: '105', name: 'Eva Davis', marks: 24, password: 'student123', createdAt: new Date().toISOString() },
];

let attendance = [];
let studentIdCounter = 6;
let attendanceIdCounter = 1;

function seedAttendance() {
  const today = new Date();
  for (let i = 9; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      const dateStr = d.toISOString().split('T')[0];
      for (const s of students) {
        const present = Math.random() > 0.2;
        attendance.push({
          id: attendanceIdCounter++,
          studentId: s.id,
          date: dateStr,
          status: present ? 'present' : 'absent',
          markedBy: 'admin',
        });
      }
    }
  }
}
seedAttendance();

module.exports = {
  // Students
  getAllStudents() {
    return students.map(({ password, ...s }) => s).sort((a, b) => a.rollNo.localeCompare(b.rollNo));
  },
  getStudentById(id) {
    const s = students.find(st => st.id === Number(id));
    if (!s) return null;
    const { password, ...rest } = s;
    return rest;
  },
  getStudentByRollNo(rollNo) {
    return students.find(s => s.rollNo === rollNo) || null;
  },
  addStudent({ rollNo, name, marks }) {
    const s = { id: studentIdCounter++, rollNo, name, marks: Number(marks), password: 'student123', createdAt: new Date().toISOString() };
    students.push(s);
    const { password, ...rest } = s;
    return rest;
  },
  updateStudent(id, { rollNo, name, marks }) {
    const s = students.find(st => st.id === Number(id));
    if (!s) return null;
    s.rollNo = rollNo;
    s.name = name;
    s.marks = Number(marks);
    const { password, ...rest } = s;
    return rest;
  },
  deleteStudent(id) {
    const idx = students.findIndex(s => s.id === Number(id));
    if (idx === -1) return false;
    students.splice(idx, 1);
    attendance = attendance.filter(a => a.studentId !== Number(id));
    return true;
  },
  getStats() {
    const total = students.length;
    if (total === 0) return { totalStudents: 0, averageMarks: 0, passed: 0, failed: 0, passPercentage: 0, total: 0, present: 0, attendancePercentage: 0 };
    const sum = students.reduce((a, s) => a + s.marks, 0);
    const passed = students.filter(s => s.marks >= 35).length;
    const failed = total - passed;
    const attTotal = attendance.length;
    const attPresent = attendance.filter(a => a.status === 'present').length;
    return {
      totalStudents: total,
      averageMarks: Math.round((sum / total) * 10) / 10,
      passed,
      failed,
      passPercentage: Math.round((passed / total) * 1000) / 10,
      total: attTotal,
      present: attPresent,
      attendancePercentage: attTotal > 0 ? Math.round((attPresent / attTotal) * 1000) / 10 : 0,
    };
  },

  // Auth
  authStudent(rollNo, password) {
    const s = students.find(st => st.rollNo === rollNo && st.password === password);
    if (!s) return null;
    const { password: p, ...rest } = s;
    return rest;
  },

  // Attendance
  getAttendanceByDate(date) {
    return attendance
      .filter(a => a.date === date)
      .map(a => {
        const s = students.find(st => st.id === a.studentId);
        return { ...a, rollNo: s ? s.rollNo : '?', name: s ? s.name : '?' };
      })
      .sort((a, b) => a.rollNo.localeCompare(b.rollNo));
  },
  getAttendanceByStudent(studentId) {
    return attendance
      .filter(a => a.studentId === Number(studentId))
      .sort((a, b) => b.date.localeCompare(a.date));
  },
  getAttendanceStats(studentId) {
    const records = attendance.filter(a => a.studentId === Number(studentId));
    const total = records.length;
    const present = records.filter(a => a.status === 'present').length;
    const absent = total - present;
    return {
      total,
      present,
      absent,
      percentage: total > 0 ? Math.round((present / total) * 1000) / 10 : 0,
    };
  },
  saveAttendance(date, records) {
    let count = 0;
    for (const r of records) {
      const existing = attendance.findIndex(a => a.studentId === r.studentId && a.date === date);
      if (existing >= 0) {
        attendance[existing].status = r.status;
        count++;
      } else {
        attendance.push({ id: attendanceIdCounter++, studentId: r.studentId, date, status: r.status, markedBy: 'admin' });
        count++;
      }
    }
    return count;
  },
};
