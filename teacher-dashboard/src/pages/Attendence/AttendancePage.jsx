import { useEffect, useState } from 'react';
import axios from 'axios';
import './AttendencePage.css'; // Import the CSS file for styling
import Navbar from '../../components/Navbar/Navbar';

const AttendancePage = () => {
  const [classes, setClasses] = useState([]); // List of classes fetched from the backend
  const [selectedClass, setSelectedClass] = useState(''); // Selected class
  const [students, setStudents] = useState([]); // List of students in the selected class
  const [attendance, setAttendance] = useState({}); // Attendance data
  const [error, setError] = useState(''); // Error message
  const [loading, setLoading] = useState(false); // For loading state management

  // Fetch available classes when the component is mounted
  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true); // Start loading
      try {
        const res = await axios.get('http://localhost:5000/api/students/classes');
        setClasses(res.data); // Set available classes
      } catch (err) {
        setError('Error fetching classes.');
        console.error('Error fetching classes:', err.response?.data || err.message);
      } finally {
        setLoading(false); // End loading
      }
    };
    fetchClasses();
  }, []);

  // Fetch students for the selected class
  useEffect(() => {
    if (selectedClass) {
      const fetchStudents = async () => {
        setLoading(true); // Start loading
        try {
          const res = await axios.get(`http://localhost:5000/api/students/attendance/${selectedClass}`);
          if (res.data.length === 0) {
            setError(`No students found for class ${selectedClass}.`);
            setStudents([]); // Clear students list if no students found
          } else {
            setStudents(res.data); // Set students for the selected class
            setError(''); // Clear any previous errors
          }
        } catch (err) {
          setError('Error fetching students.');
          console.error('Error fetching students:', err.response?.data || err.message);
        } finally {
          setLoading(false); // End loading
        }
      };
      fetchStudents();
    } else {
      setStudents([]); // Clear students if no class is selected
    }
  }, [selectedClass]);

  // Handle attendance change for a student
  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prevAttendance) => ({
      ...prevAttendance,
      [studentId]: status,
    }));
  };

  // Submit attendance data
  const handleSubmit = async () => {
    if (Object.keys(attendance).length === 0) {
      setError('No attendance marked.');
      return;
    }
  
    setLoading(true); // Start loading during submission
    try {
      const attendanceData = Object.keys(attendance).map((studentId) => ({
        studentId,
        status: attendance[studentId],
      }));
  
      console.log('Submitting Attendance Data:', attendanceData);
  
      const res = await axios.post(
        `http://localhost:5000/api/students/attendance/${selectedClass}`,
        { attendanceData }
      );
  
      alert('Attendance submitted successfully!');
      console.log('Server response:', res.data);
  
      setAttendance({}); // Clear attendance
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error submitting attendance.';
      setError(errorMsg);
      console.error('Error submitting attendance:', err.response?.data || err.message);
    } finally {
      setLoading(false); // End loading
    }
  };
  return (
    <div>
      <Navbar />

      <div className="attendance-page">
        <h1>Mark Attendance</h1>

        {/* Display error message */}
        {error && <div className="error-message">{error}</div>}

        {/* Class selection */}
        <div className="class-selection">
          <label htmlFor="class">Choose Class:</label>
          <select
            id="class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={loading}
          >
            <option value="">Select a class</option>
            {classes.map((className, index) => (
              <option key={index} value={className}>
                {className}
              </option>
            ))}
          </select>
        </div>

        {/* Show loading spinner if classes or students are being fetched */}
        {loading && <div className="loading">Loading...</div>}

        {/* Show students in the selected class */}
        {selectedClass && students.length > 0 && (
          <div className="students-list">
            <h3>Students in {selectedClass}</h3>
            <ul>
              {students.map((student) => (
                <li key={student._id}>
                  <div className="student-details">
                    <span>{student.name} - {student.class}</span>
                    <div className="attendance-options">
                      <button
                        onClick={() => handleAttendanceChange(student._id, 'Present')}
                        disabled={loading || attendance[student._id] === 'Present'}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => handleAttendanceChange(student._id, 'Absent')}
                        disabled={loading || attendance[student._id] === 'Absent'}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit button */}
        {students.length > 0 && (
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={loading || Object.keys(attendance).length === 0}
          >
            {loading ? 'Submitting...' : 'Submit Attendance'}
          </button>
        )}

        {/* Display message if no students are available */}
        {selectedClass && students.length === 0 && (
          <div className="no-students-message">No students to mark attendance for in this class.</div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;