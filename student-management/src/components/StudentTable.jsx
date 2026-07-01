import { useStudents } from '../context/StudentContext';

export default function StudentTable({ students, onEdit, handleSort, sortKey, sortDir, getGrade, simple }) {
  const { deleteStudent } = useStudents();

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      await deleteStudent(id);
    }
  };

  const SortIcon = ({ field }) => {
    if (!handleSort) return null;
    return <span className="sort-icon" onClick={() => handleSort(field)}>
      {sortKey === field ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}
    </span>;
  };

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th># <SortIcon field="rollNo" /></th>
            <th>Name <SortIcon field="name" /></th>
            <th>Marks <SortIcon field="marks" /></th>
            <th>Grade</th>
            {!simple && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.id}>
              <td>{s.rollNo}</td>
              <td>{s.name}</td>
              <td className={s.marks >= 35 ? 'text-green' : 'text-red'}>{s.marks}</td>
              <td><span className={`badge ${s.marks >= 35 ? 'badge-pass' : 'badge-fail'}`}>{getGrade(s.marks)}</span></td>
              {!simple && (
                <td className="actions">
                  <button className="btn btn-sm btn-edit" onClick={() => onEdit(s)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.id, s.name)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
          {students.length === 0 && (
            <tr><td colSpan={simple ? 4 : 5} className="text-center">No students found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
