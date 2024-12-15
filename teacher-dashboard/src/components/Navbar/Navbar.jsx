    import React, { useState } from "react";
    import { Link } from "react-router-dom";
    import "./Navbar.css"; // Import the custom CSS file

    const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
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
            <Link to="/add-student" className="navbar-link">Add Student</Link>
            <Link to="/list-students" className="navbar-link">List Students</Link>
             <Link to="/check-attendance" className="navbar-link">Mark Attendance</Link>
            <Link to="/attendance" className="navbar-link">Attendence</Link>

            </div>
        </div>
        </nav>
    );
    };

    export default Navbar;
