import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css"; // Import the custom CSS file

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token from localStorage
    navigate("/login"); // Redirect to the login page
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          Dashboard
        </Link>
        <button
          className="navbar-toggle"
          onClick={toggleMenu}
          aria-label="Toggle navigation"
          aria-expanded={isMenuOpen}
        >
          ☰
        </button>
        <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
          <Link to="/add-student" className="navbar-link">
            Add Student
          </Link>
          <Link to="/list-students" className="navbar-link">
            List Students
          </Link>
          <Link to="/check-attendance" className="navbar-link">
            Mark Attendance
          </Link>
          <Link to="/attendance" className="navbar-link">
            Attendance
          </Link>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
