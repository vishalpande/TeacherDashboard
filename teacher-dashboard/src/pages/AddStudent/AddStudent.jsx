import { useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';
import './AddStudent.css'; // Import the new CSS file

const AddStudent = () => {
    const [student, setStudent] = useState({ name: '', email: '', rollNumber: '', class: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form fields before sending the request
        if (!student.name || !student.email || !student.rollNumber || !student.class) {
            setError('All fields are required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Update URL based on the correct API endpoint
            await axios.post('http://localhost:5000/api/students', student);  // Assuming '/api' is the base route
            alert('Student added successfully!');
            setStudent({ name: '', email: '', rollNumber: '', class: '' });  // Clear form after success
        } catch (err) {
            console.error('Error details:', err);  // Log the error for debugging

            // Check if the error is from the response
            if (err.response) {
                setError('Error adding student: ' + (err.response.data.message || err.response.data));
            } else {
                setError('Error adding student: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-student-page">
            <Navbar />
            <div className="add-student-container">
                <form className="add-student-form" onSubmit={handleSubmit}>
                    <h2>Add Student</h2>
                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            placeholder="Name"
                            value={student.name}
                            onChange={(e) => setStudent({ ...student, name: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            placeholder="Email"
                            value={student.email}
                            onChange={(e) => setStudent({ ...student, email: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Roll Number</label>
                        <input
                            type="text"
                            placeholder="Roll Number"
                            value={student.rollNumber}
                            onChange={(e) => setStudent({ ...student, rollNumber: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Class</label>
                        <input
                            type="text"
                            placeholder="Class"
                            value={student.class}
                            onChange={(e) => setStudent({ ...student, class: e.target.value })}
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>} {/* Display error if exists */}
                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Student'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddStudent;
