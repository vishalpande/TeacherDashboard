import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import AddStudent from './pages/AddStudent/AddStudent';
import ListStudents from './pages/ListStudents/ListStudents';
import AttendancePage from './pages/Attendence/AttendancePage';
import CheckAttendence from './pages/CheckAttendence/CheckAttendence';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
      
        <Route path="/add-student" element={<AddStudent />} />
        <Route path="/list-students" element={<ListStudents />} />
<Route path="/check-attendance" element={<AttendancePage />} />
        <Route path="/attendance" element={<CheckAttendence />} />

        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
