import { useState, useEffect } from 'react';
import { useStudents } from '../context/StudentContext';

export default function AttendancePanel() {
  const { students, fetchStudents } = useStudents();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState({});
  const [savedRecords, setSavedRecords] = useState([]);
  const [message, setMessage] = useState('');
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  useEffect(() => {
    const init = {};
    students.forEach(s => { init[s.id] = 'present'; });
    setRecords(init);
  }, [students]);

  const handleMark = (studentId, status) => {
    setRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    const data = Object.entries(records).map(([studentId, status]) => ({
      studentId: Number(studentId), status,
    }));
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, records: data }),
      });
      const result = await res.json();
      setMessage(`Attendance saved for ${result.count} students`);
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Error saving attendance');
    }
  };

  const loadAttendance = async () => {
    const res = await fetch(`/api/attendance?date=${viewDate}`);
    const data = await res.json();
    setSavedRecords(data);
    const restored = {};
    data.forEach(r => { restored[r.studentId] = r.status; });
    if (Object.keys(restored).length > 0) setRecords(restored);
  };

  const presentCount = Object.values(records).filter(v => v === 'present').length;
  const totalCount = students.length;

  return (
    <div className="attendance-panel">
      <h1>Attendance Management</h1>

      {message && <div className="success-message">{message}</div>}

      <div className="attendance-controls">
        <div className="form-group">
          <label>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={handleSave}>Save Attendance</button>
      </div>

      <div className="attendance-summary">
        <span>Present: <strong>{presentCount}</strong></span>
        <span>Absent: <strong>{totalCount - presentCount}</strong></span>
        <span>Total: <strong>{totalCount}</strong></span>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Present</th>
              <th>Absent</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td>{s.rollNo}</td>
                <td>{s.name}</td>
                <td>
                  <input
                    type="radio"
                    name={`att-${s.id}`}
                    checked={records[s.id] === 'present'}
                    onChange={() => handleMark(s.id, 'present')}
                  />
                </td>
                <td>
                  <input
                    type="radio"
                    name={`att-${s.id}`}
                    checked={records[s.id] === 'absent'}
                    onChange={() => handleMark(s.id, 'absent')}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="view-attendance">
        <h2>View Attendance Records</h2>
        <div className="form-group">
          <label>Select Date</label>
          <input type="date" value={viewDate} onChange={e => setViewDate(e.target.value)} />
        </div>
        <button className="btn btn-secondary" onClick={loadAttendance}>Load Records</button>

        {savedRecords.length > 0 && (
          <div className="table-wrapper" style={{ marginTop: '1rem' }}>
            <table className="data-table">
              <thead>
                <tr><th>Roll No</th><th>Name</th><th>Status</th></tr>
              </thead>
              <tbody>
                {savedRecords.map(r => (
                  <tr key={r.id}>
                    <td>{r.rollNo}</td>
                    <td>{r.name}</td>
                    <td><span className={`badge ${r.status === 'present' ? 'badge-present' : 'badge-absent'}`}>{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
