import { useStudents } from '../context/StudentContext';

export default function StudentCards({ students, onEdit, getGrade }) {
  const { deleteStudent } = useStudents();

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      await deleteStudent(id);
    }
  };

  return (
    <div className="cards-grid">
      {students.map(s => (
        <div key={s.id} className={`student-card ${s.marks >= 35 ? 'card-pass' : 'card-fail'}`}>
          <div className="card-avatar">{s.name[0]}</div>
          <div className="card-body">
            <h3>{s.name}</h3>
            <div className="card-details">
              <div><strong>Roll:</strong> {s.rollNo}</div>
              <div><strong>Marks:</strong> <span className={s.marks >= 35 ? 'text-green' : 'text-red'}>{s.marks}</span></div>
              <div><strong>Grade:</strong> <span className={`badge ${s.marks >= 35 ? 'badge-pass' : 'badge-fail'}`}>{getGrade(s.marks)}</span></div>
            </div>
          </div>
          <div className="card-actions">
            <button className="btn btn-sm btn-edit" onClick={() => onEdit(s)}>Edit</button>
            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.id, s.name)}>Delete</button>
          </div>
        </div>
      ))}
      {students.length === 0 && <div className="text-center">No students found</div>}
    </div>
  );
}
