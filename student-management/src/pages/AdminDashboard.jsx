import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStudents } from '../context/StudentContext';
import StatsCards from '../components/StatsCards';
import StudentForm from '../components/StudentForm';
import StudentTable from '../components/StudentTable';
import StudentCards from '../components/StudentCards';
import AttendancePanel from '../components/AttendancePanel';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { students, fetchStudents } = useStudents();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('table');
  const [editingStudent, setEditingStudent] = useState(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('rollNo');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleLogout = () => { logout(); navigate('/'); };

  const filtered = students
    .filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.includes(search)
    )
    .sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey];
      if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va;
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleView = () => setViewMode(v => v === 'table' ? 'cards' : 'table');

  const getGrade = (marks) => {
    if (marks >= 90) return 'A+';
    if (marks >= 75) return 'A';
    if (marks >= 60) return 'B';
    if (marks >= 50) return 'C';
    if (marks >= 35) return 'D';
    return 'F';
  };

  return (
    <div className="admin-layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>SMS</h2>
          <span className="badge badge-admin">Admin</span>
        </div>
        <div className="sidebar-user">
          <div className="avatar">{user?.name?.[0]}</div>
          <span>{user?.name}</span>
        </div>
        <ul className="sidebar-nav">
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => { setActiveTab('dashboard'); setPage(1); }}>
            Dashboard
          </li>
          <li className={activeTab === 'students' ? 'active' : ''} onClick={() => { setActiveTab('students'); setPage(1); }}>
            Students
          </li>
          <li className={activeTab === 'attendance' ? 'active' : ''} onClick={() => { setActiveTab('attendance'); setPage(1); }}>
            Attendance
          </li>
        </ul>
        <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <>
            <h1>Dashboard</h1>
            <StatsCards students={students} />
            <div className="recent-section">
              <h2>Recent Students</h2>
              <StudentTable
                students={students.slice(-3).reverse()}
                onEdit={(s) => { setEditingStudent(s); setActiveTab('students'); }}
                onDelete={() => {}}
                getGrade={getGrade}
                simple
              />
            </div>
          </>
        )}

        {activeTab === 'students' && (
          <>
            <div className="tab-header">
              <h1>Student Management</h1>
              <div className="header-actions">
                <input
                  type="text"
                  placeholder="Search by name or roll..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="search-input"
                />
                <button className="btn btn-icon" onClick={toggleView} title={viewMode === 'table' ? 'Card View' : 'Table View'}>
                  {viewMode === 'table' ? '📇' : '📋'}
                </button>
              </div>
            </div>

            <StudentForm
              editingStudent={editingStudent}
              onCancel={() => setEditingStudent(null)}
              students={students}
            />

            {viewMode === 'table' ? (
              <StudentTable
                students={paginated}
                onEdit={setEditingStudent}
                onDelete={() => {}}
                handleSort={handleSort}
                sortKey={sortKey}
                sortDir={sortDir}
                getGrade={getGrade}
              />
            ) : (
              <StudentCards
                students={paginated}
                onEdit={setEditingStudent}
                onDelete={() => {}}
                getGrade={getGrade}
              />
            )}

            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                <span>Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            )}

            <div className="total-count">Total: {students.length} students</div>
          </>
        )}

        {activeTab === 'attendance' && <AttendancePanel />}
      </main>
    </div>
  );
}
