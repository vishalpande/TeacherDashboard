import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CheckAttendance = () => {
  const [className, setClassName] = useState('');  // To capture the selected class name
  const [attendanceData, setAttendanceData] = useState([]); // Store fetched attendance data
  const [error, setError] = useState(null); // To handle any errors

  // Fetch attendance summary when className is changed
  const getAttendanceSummary = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/attendance/summary/${className}`); 
      setAttendanceData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch attendance summary');
      setAttendanceData([]);
    }
  };

  useEffect(() => {
    if (className) {
      getAttendanceSummary(); // Fetch attendance data whenever className changes
    }
  }, [className]);

  return (
    <div className="container mt-5">
      <h2>Attendance Summary</h2>

      <div className="mb-3">
        <label htmlFor="classSelect" className="form-label">Enter Class (e.g., 10A)</label>
        <input
          type="text"
          id="classSelect"
          className="form-control"
          value={className}
          onChange={(e) => setClassName(e.target.value)} // Update the className state
          placeholder="Enter class (e.g., 10A)"
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}  {/* Error message if fetching fails */}

      {/* Display attendance data if fetched */}
      {attendanceData.length > 0 ? (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Roll Number</th>
              <th>Attendance Percentage</th>
              <th>Attendance Records</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((student, index) => (
              <tr key={index}>
                <td>{student.name}</td>
                <td>{student.rollNumber}</td>
                <td>{student.attendancePercentage}%</td>
                <td>
                  <ul>
                    {student.records.map((rec, idx) => (
                      <li key={idx}>
                        {new Date(rec.date).toLocaleDateString()} - {rec.status}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No attendance data available</div>
      )}
    </div>
  );
};

export default CheckAttendance;
