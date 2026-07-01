import { useState, useEffect } from 'react';
import { useStudents } from '../context/StudentContext';

export default function StudentForm({ editingStudent, onCancel, students }) {
  const { addStudent, updateStudent } = useStudents();
  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [marks, setMarks] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (editingStudent) {
      setRollNo(editingStudent.rollNo);
      setName(editingStudent.name);
      setMarks(String(editingStudent.marks));
    }
  }, [editingStudent]);

  const resetForm = () => {
    setRollNo(''); setName(''); setMarks(''); setErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!rollNo.trim()) errs.rollNo = 'Roll number is required';
    if (!name.trim()) errs.name = 'Name is required';
    if (!marks.toString().trim()) errs.marks = 'Marks is required';
    else if (isNaN(marks) || Number(marks) < 0 || Number(marks) > 100) errs.marks = 'Marks must be between 0 and 100';
    if (!editingStudent && students.some(s => s.rollNo === rollNo.trim())) errs.rollNo = 'Roll number already exists';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, { rollNo: rollNo.trim(), name: name.trim(), marks: Number(marks) });
        setSuccess('Student updated successfully!');
        onCancel();
      } else {
        await addStudent({ rollNo: rollNo.trim(), name: name.trim(), marks: Number(marks) });
        setSuccess('Student added successfully!');
        resetForm();
      }
    } catch (err) {
      setErrors({ form: err.message });
    }
  };

  const isEditing = !!editingStudent;

  return (
    <div className="form-container">
      <h2>{isEditing ? 'Edit Student' : 'Add New Student'}</h2>
      {success && <div className="success-message">{success}</div>}
      {errors.form && <div className="error-message">{errors.form}</div>}
      <form onSubmit={handleSubmit} className="student-form">
        <div className="form-row">
          <div className="form-group">
            <label>Roll Number</label>
            <input
              type="text" value={rollNo} onChange={e => setRollNo(e.target.value)}
              className={errors.rollNo ? 'input-error' : ''}
              placeholder="e.g. 106"
            />
            {errors.rollNo && <span className="field-error">{errors.rollNo}</span>}
          </div>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              className={errors.name ? 'input-error' : ''}
              placeholder="e.g. John Doe"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label>Marks</label>
            <input
              type="number" value={marks} onChange={e => setMarks(e.target.value)}
              className={errors.marks ? 'input-error' : ''}
              placeholder="0-100"
              min="0" max="100"
            />
            {errors.marks && <span className="field-error">{errors.marks}</span>}
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {isEditing ? 'Update Student' : 'Add Student'}
          </button>
          {isEditing && <button type="button" className="btn btn-secondary" onClick={() => { onCancel(); resetForm(); }}>Cancel</button>}
        </div>
      </form>
    </div>
  );
}
