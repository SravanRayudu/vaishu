import { createContext, useContext, useState, useCallback } from 'react';

const API = '/api';

const StudentContext = createContext(null);

export function StudentProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/students`);
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addStudent = async (student) => {
    const res = await fetch(`${API}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setStudents(prev => [...prev, data]);
    return data;
  };

  const updateStudent = async (id, student) => {
    const res = await fetch(`${API}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setStudents(prev => prev.map(s => s.id === id ? data : s));
    return data;
  };

  const deleteStudent = async (id) => {
    await fetch(`${API}/students/${id}`, { method: 'DELETE' });
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  return (
    <StudentContext.Provider value={{ students, loading, fetchStudents, addStudent, updateStudent, deleteStudent }}>
      {children}
    </StudentContext.Provider>
  );
}

export const useStudents = () => useContext(StudentContext);
