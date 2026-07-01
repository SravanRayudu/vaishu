import { useState, useEffect } from 'react';

export default function StatsCards({ students }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/students/stats/summary')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, [students]);

  if (!stats) {
    return <div className="stats-grid">
      {[1,2,3,4,5].map(i => <div key={i} className="stat-card skeleton">&nbsp;</div>)}
    </div>;
  }

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <span className="stat-icon">👥</span>
        <span className="stat-number">{stats.totalStudents}</span>
        <span className="stat-label">Total Students</span>
      </div>
      <div className="stat-card">
        <span className="stat-icon">📊</span>
        <span className="stat-number">{stats.averageMarks}</span>
        <span className="stat-label">Avg Marks</span>
      </div>
      <div className="stat-card">
        <span className="stat-icon">✅</span>
        <span className="stat-number">{stats.passPercentage}%</span>
        <span className="stat-label">Pass Rate</span>
      </div>
      <div className="stat-card">
        <span className="stat-icon">❌</span>
        <span className="stat-number">{stats.failed}</span>
        <span className="stat-label">Failed</span>
      </div>
      <div className="stat-card">
        <span className="stat-icon">📅</span>
        <span className="stat-number">{stats.attendancePercentage}%</span>
        <span className="stat-label">Attendance</span>
      </div>
    </div>
  );
}
