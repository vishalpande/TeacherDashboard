import { useEffect, useState } from 'react';
import axios from 'axios';
import './ListStudents.css';
import Navbar from '../../components/Navbar/Navbar';

const StudentItem = ({ student }) => (
  <li key={student._id} className="student-item">
    <div><strong>Name:</strong> {student.name}</div>
    <div><strong>Roll Number:</strong> {student.rollNumber}</div>
    <div><strong>Class:</strong> {student.class}</div>
    <div><strong>Email:</strong> {student.email}</div>
  </li>
);

const ListStudents = () => {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('name'); // Default sort field

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/students');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setStudents(res.data);
        } else {
          setError('No students found.');
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setError(
          'Failed to fetch students: ' + (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Sorting logic
  const handleSort = (field) => {
    setSortField(field);
    const sortedStudents = [...students].sort((a, b) => {
      if (a[field] < b[field]) return -1;
      if (a[field] > b[field]) return 1;
      return 0;
    });
    setStudents(sortedStudents);
  };

  return (
    <div className="students-page">
      <Navbar />
      <div className="students-container">
        {loading ? (
          <p className="loading-message">Loading students...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <>
            <div className="sort-container">
              <label htmlFor="sort">Sort by:</label>
              <select
                id="sort"
                value={sortField}
                onChange={(e) => handleSort(e.target.value)}
              >
                <option value="name">Name</option>
                <option value="rollNumber">Roll Number</option>
                <option value="class">Class</option>
                <option value="email">Email</option>
              </select>
            </div>
            <ul className="students-list">
              {students.map((student) => (
                <StudentItem key={student._id} student={student} />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default ListStudents;
