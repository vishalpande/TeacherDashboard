import { useEffect, useState } from 'react';
import axios from 'axios';
import './AttendencePage.css'; // Import the CSS file for styling
import Navbar from '../../components/Navbar/Navbar';

const AttendancePage = () => {
  const [classes, setClasses] = useState([]); // List of classes fetched from the backend
  const [selectedClass, setSelectedClass] = useState(''); // Selected class
  const [students, setStudents] = useState([]); // List of students in the selected class
  const [attendance, setAttendance] = useState({}); // Attendance data (keyed by studentId)
  const [loadingState, setLoadingState] = useState({ loading: false, error: '' }); // Error and loading state

  // Fetch available classes when the component is mounted
  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingState({ loading: true, error: '' });
      try {
        const res = await axios.get('http://localhost:5000/api/students/classes');
        setClasses(res.data); // Set available classes
      } catch (err) {
        setLoadingState({ loading: false, error: 'Error fetching classes.' });
        console.error('Error fetching classes:', err.response?.data || err.message);
      } finally {
        setLoadingState((prevState) => ({ ...prevState, loading: false }));
      }
    };
    fetchClasses();
  }, []);

  // Fetch students for the selected class
  useEffect(() => {
    if (selectedClass) {
      const fetchStudents = async () => {
        setLoadingState({ loading: true, error: '' });
        try {
          const res = await axios.get(`http://localhost:5000/api/students/attendance/summary/${selectedClass}`);
          if (res.data.length === 0) {
            setLoadingState({ loading: false, error: `No students found for class ${selectedClass}.` });
            setStudents([]); // Clear students list if no students found
          } else {
            setStudents(res.data); // Set students for the selected class
            setLoadingState({ loading: false, error: '' });
          }
        } catch (err) {
          setLoadingState({ loading: false, error: 'Error fetching students.' });
          console.error('Error fetching students:', err.response?.data || err.message);
        }
      };
      fetchStudents();
    } else {
      setStudents([]); // Clear students if no class is selected
    }
  }, [selectedClass]);

  // Handle attendance change for a specific student
  const handleAttendanceChange = (student, status) => {
    if (!student) {
      console.error('Student object is undefined or null');
      return;
    }

    const studentId = student._id || `${student.rollNumber}-${student.name}`; // Fallback to rollNumber and name if _id is not available
    if (!studentId) {
      console.error('Student ID is missing');
      return;
    }

    setAttendance((prevAttendance) => ({
      ...prevAttendance,
      [studentId]: status, // Update attendance only for the clicked student
    }));
  };

  // Submit attendance data
  const handleSubmit = async () => {
    if (Object.keys(attendance).length === 0) {
      setLoadingState({ loading: false, error: 'No attendance marked.' });
      return;
    }

    setLoadingState({ loading: true, error: '' });

    // Prepare attendance data
    const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({
      studentId, // Ensure this is the correct key for the student ID (whether _id or fallback value)
      status,
    }));

    console.log('Attendance Data to be submitted:', attendanceData);  // Log the data being sent

    try {
      const res = await axios.post(
        `http://localhost:5000/api/students/attendance/${selectedClass}`,
        { attendanceData }
      );

      alert('Attendance submitted successfully!');
      console.log('Server response:', res.data);

      setAttendance({}); // Clear attendance after submission
    } catch (err) {
      setLoadingState({
        loading: false,
        error: err.response?.data?.message || 'Error submitting attendance.',
      });
      console.error('Error submitting attendance:', err.response?.data || err.message);
    } finally {
      setLoadingState((prevState) => ({ ...prevState, loading: false }));
    }
  };
   // Log to verify the data

  return (
    <div>
      <Navbar />

      <div className="attendance-page">
        <h1>Mark Attendance</h1>

        {/* Display error message */}
        {loadingState.error && <div className="error-message">{loadingState.error}</div>}

        {/* Class selection */}
        <div className="class-selection">
          <label htmlFor="class">Choose Class:</label>
          <select
            id="class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={loadingState.loading}
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
        {loadingState.loading && <div className="loading">Loading...</div>}

        {/* Show students in the selected class */}
        {selectedClass && students.length > 0 && (
          <div className="students-list">
            <h3>Students in {selectedClass}</h3>
            <ul>
              {students.map((student) => {
                // Fallback to a unique combination of student._id and rollNumber if _id is not unique
                const uniqueKey = student._id ? student._id : `${student.rollNumber}-${student.name}`;

                return (
                  <li key={uniqueKey}>
                    <div className="student-details">
                      <span>{student.name} - {student.rollNumber}</span>
                      <div className="attendance-options">
                        <button
                          onClick={() => handleAttendanceChange(student, 'Present')}
                          disabled={loadingState.loading || attendance[uniqueKey] === 'Present'}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(student, 'Absent')}
                          disabled={loadingState.loading || attendance[uniqueKey] === 'Absent'}
                        >
                          Absent
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Submit button */}
        {students.length > 0 && (
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={loadingState.loading || Object.keys(attendance).length === 0}
          >
            {loadingState.loading ? 'Submitting...' : 'Submit Attendance'}
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
