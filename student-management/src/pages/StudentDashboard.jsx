import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [student, setStudent] = useState(null);
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    fetch(`/api/students/${id}`)
      .then(r => r.json())
      .then(setStudent);
    fetch(`/api/attendance?studentId=${id}`)
      .then(r => r.json())
      .then(setAttendance);
    fetch(`/api/attendance/stats/${id}`)
      .then(r => r.json())
      .then(setStats);
  }, [id]);

  const handleLogout = () => { logout(); navigate('/'); };

  const getGrade = (marks) => {
    if (marks >= 90) return 'A+';
    if (marks >= 75) return 'A';
    if (marks >= 60) return 'B';
    if (marks >= 50) return 'C';
    if (marks >= 35) return 'D';
    return 'F';
  };

  if (!student) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="student-dashboard">
      <header className="student-header">
        <div>
          <h1>Welcome, {student.name}</h1>
          <p className="roll-badge">Roll No: {student.rollNo}</p>
        </div>
        <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
      </header>

      <div className="student-grid">
        <div className="profile-card">
          <div className="profile-avatar">{student.name[0]}</div>
          <h2>{student.name}</h2>
          <table className="profile-details">
            <tbody>
              <tr><td>Roll Number</td><td>{student.rollNo}</td></tr>
              <tr><td>Marks</td><td className={student.marks >= 35 ? 'text-green' : 'text-red'}>{student.marks}</td></tr>
              <tr><td>Grade</td><td className={student.marks >= 35 ? 'text-green' : 'text-red'}>{getGrade(student.marks)}</td></tr>
              <tr><td>Status</td><td>{student.marks >= 35 ? 'Passed' : 'Failed'}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="attendance-summary-card">
          <h2>Attendance</h2>
          {stats && (
            <div className="attendance-stats">
              <div className="stat-circle">
                <svg viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e0e0e0" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={stats.percentage >= 75 ? '#22c55e' : '#ef4444'} strokeWidth="3" strokeDasharray={`${stats.percentage}, 100`} />
                </svg>
                <span className="stat-value">{stats.percentage}%</span>
              </div>
              <div className="stat-details">
                <div><span className="dot-green"></span> Present: {stats.present}</div>
                <div><span className="dot-red"></span> Absent: {stats.absent}</div>
                <div>Total days: {stats.total}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="attendance-history">
        <div className="section-header">
          <h2>Attendance History</h2>
          <button className="btn btn-sm" onClick={() => setViewMode(v => v === 'table' ? 'calendar' : 'table')}>
            {viewMode === 'table' ? 'Calendar View' : 'Table View'}
          </button>
        </div>

        {viewMode === 'table' ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map(a => (
                <tr key={a.id}>
                  <td>{a.date}</td>
                  <td>
                    <span className={`badge ${a.status === 'present' ? 'badge-present' : 'badge-absent'}`}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr><td colSpan={2} className="text-center">No attendance records</td></tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="calendar-grid">
            {attendance.map(a => {
              const d = new Date(a.date);
              return (
                <div key={a.id} className={`calendar-day ${a.status}`}>
                  <span className="day-num">{d.getDate()}</span>
                  <span className="day-month">{d.toLocaleString('en', { month: 'short' })}</span>
                  <span className={`day-status ${a.status === 'present' ? 'text-green' : 'text-red'}`}>
                    {a.status === 'present' ? 'P' : 'A'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
