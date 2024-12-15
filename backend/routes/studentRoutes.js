const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

// Add Student Route
router.post('/', async (req, res) => {
  try {
    const { name, rollNumber, class: studentClass, email } = req.body;

    // Validate input data
    if (!name || !rollNumber || !studentClass || !email) {
      return res.status(400).json({ message: 'Missing required fields: name, rollNumber, class, email' });
    }

    // Check if student already exists by roll number or email
    const existingStudent = await Student.findOne({ $or: [{ rollNumber }, { email }] });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this roll number or email already exists' });
    }

    // Create and save new student
    const student = new Student({ name, rollNumber, class: studentClass, email });
    await student.save();

    // Return success response
    res.status(201).json({
      message: 'Student added successfully',
      student: { name: student.name, rollNumber: student.rollNumber, class: student.class, email: student.email },
    });
  } catch (err) {
    console.error('Error adding student:', err.message);
    res.status(500).json({ message: 'Failed to add student', error: err.message });
  }
});

// List Students Route
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });

    if (!students.length) {
      return res.status(404).json({ message: 'No students found' });
    }

    res.status(200).json(students); // Return the array directly
  } catch (err) {
    console.error('Error fetching students:', err.message);
    res.status(500).json({ message: 'Failed to fetch students', error: err.message });
  }
});

// Fetch unique classes from the students collection
router.get('/classes', async (req, res) => {
  try {
    const classes = await Student.distinct('class');
    if (!classes.length) {
      return res.status(404).json({ message: 'No classes found' });
    }
    res.status(200).json(classes);
  } catch (err) {
    console.error('Error fetching classes:', err.message);
    res.status(500).json({ message: 'Failed to fetch classes', error: err.message });
  }
});

// Get students by class
router.get('/attendance/summary/:class', async (req, res) => {
  const { class: className } = req.params;
  console.log("Fetching attendance summary for class:", className);

  try {
    // Find students in the given class
    const students = await Student.find({ class: className });

    if (!students.length) {
      return res.status(404).json({ message: `No students found in class ${className}` });
    }

    // Get the list of student IDs for attendance query
    const studentIds = students.map(student => student._id);

    // Fetch attendance records for all students in one query
    const attendanceRecords = await Attendance.find({ studentId: { $in: studentIds } });

    // Create attendance summary for each student
    const studentSummary = students.map((student) => {
      // Filter attendance records for the current student
      const studentAttendanceRecords = attendanceRecords.filter(
        (rec) => rec.studentId.toString() === student._id.toString()
      );

      const totalClasses = studentAttendanceRecords.length;
      const attendedClasses = studentAttendanceRecords.filter((rec) => rec.status === 'present').length;
      const attendancePercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

      return {
        name: student.name,
        rollNumber: student.rollNumber,
        attendancePercentage: attendancePercentage.toFixed(2),
        records: studentAttendanceRecords.map((rec) => ({
          date: rec.date,
          status: rec.status,
        })),
      };
    });

    // Return the attendance summary
    res.status(200).json(studentSummary);
  } catch (err) {
    console.error("Error fetching attendance summary:", err.message);
    res.status(500).json({ message: "Failed to fetch attendance summary.", error: err.message });
  }
});


  

// Mark Attendance for students in the selected class
router.post('/attendance/:class', async (req, res) => {
  try {
    const { class: className } = req.params;
    const { attendanceData } = req.body;

    // Log incoming data for debugging
    console.log('Incoming Attendance Data:', attendanceData);
    console.log('Class Name:', className);

    // Validate request body
    if (!attendanceData || !Array.isArray(attendanceData) || attendanceData.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty attendance data.' });
    }

    // Fetch students for the given class
    const studentsInClass = await Student.find({ class: className });
    if (studentsInClass.length === 0) {
      return res.status(404).json({ message: `No students found in class ${className}.` });
    }

    // Map valid student IDs
    const validStudentIds = studentsInClass.map((student) => student._id.toString());

    // Process each attendance entry
    const attendanceRecords = [];
    for (const { studentId, status } of attendanceData) {
      if (!validStudentIds.includes(studentId)) {
        console.warn(`Skipping invalid studentId: ${studentId}`);
        continue; // Skip invalid student ID
      }

      try {
        // Ensure studentId is valid ObjectId format
        const objectId = mongoose.Types.ObjectId(studentId); // Try converting to ObjectId

        // Check if attendance record for the student exists for today
        const existingRecord = await Attendance.findOne({
          studentId: objectId,
          date: { $gte: new Date().setHours(0, 0, 0, 0) }, // Check for today's date
        });

        if (existingRecord) {
          // If record exists, update it
          existingRecord.status = status;
          const updatedRecord = await existingRecord.save();
          attendanceRecords.push(updatedRecord);
        } else {
          // If record doesn't exist, create a new one
          const attendanceRecord = new Attendance({
            studentId: objectId,
            status,
            date: new Date(),
          });

          const savedRecord = await attendanceRecord.save();
          attendanceRecords.push(savedRecord);
        }
      } catch (err) {
        console.error(`Failed to process attendance for student ${studentId}:`, err.message);
        // Log specific error for each student
        return res.status(500).json({ message: `Failed to process attendance for student ${studentId}.`, error: err.message });
      }
    }

    // If no attendance records were processed successfully
    if (attendanceRecords.length === 0) {
      return res.status(500).json({ message: 'Failed to mark attendance for all students. Please check the data.' });
    }

    // Return success response with all saved records
    res.status(201).json({
      message: 'Attendance marked successfully.',
      attendanceRecords: attendanceRecords.map((record) => ({
        studentId: record.studentId,
        status: record.status,
        date: record.date,
      })),
    });
  } catch (err) {
    console.error('Error marking attendance:', err.message);
    // General server error response
    res.status(500).json({ message: 'Failed to mark attendance. Please try again later.', error: err.message });
  }
});

module.exports = router;
