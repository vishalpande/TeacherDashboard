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
    console.log("test")
  
    try {
      // Find students in the given class
      const students = await Student.find({ class: className });
  
      if (!students.length) {
        return res.status(404).json({ message: `No students found in class ${className}` });
      }
  
      // Fetch attendance records for each student
      const studentSummary = await Promise.all(
        students.map(async (student) => {
          const attendanceRecords = await Attendance.find({ studentId: student._id });
  
          const totalClasses = attendanceRecords.length;
          const attendedClasses = attendanceRecords.filter((rec) => rec.status === 'Present').length;
          const attendancePercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
  
          return {
            name: student.name,
            rollNumber: student.rollNumber,
            attendancePercentage: attendancePercentage.toFixed(2),
            records: attendanceRecords.map((rec) => ({
              date: rec.date,
              status: rec.status,
            })),
          };
        })
      );
  
      // Return the attendance summary
      res.status(200).json(studentSummary);
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
      res.status(500).json({ error: 'Failed to fetch attendance summary' });
    }
  });
  
  // Mark Attendance for students in the selected class
  router.post('/attendance/:class', async (req, res) => {
    try {
      const { class: className } = req.params;
      const { attendanceData } = req.body;

      
  
      // Log incoming data
      console.log('Class Name:', className);
      console.log('Attendance Data:', attendanceData);
      console.log('Attendance Data step 1');
  
      // Validate request body
      if (!attendanceData || !Array.isArray(attendanceData) || attendanceData.length === 0) {
        return res.status(400).json({ message: 'Invalid or empty attendance data.' });
      }
      console.log('Attendance Data step 2');

      // Fetch students for the given class
      const studentsInClass = await Student.find({ class: className });
      if (studentsInClass.length === 0) {
        return res.status(404).json({ message: `No students found in class ${className}.` });
      }
      console.log('Attendance Data step 3');
      // Map valid student IDs
      const validStudentIds = studentsInClass.map((student) => student._id.toString());
  
      const attendanceRecords = [];
      console.log('Attendance Data step 4');
  
      // Process each attendance entry
      for (const { studentId, status } of attendanceData) {
        if (!validStudentIds.includes(studentId)) {
          console.warn(`Skipping invalid studentId: ${studentId}`);
          continue;
        }
        console.log('Attendance Data step 5');
        try {
            console.log('Attendance Data step 5.1');
          const attendanceRecord = new Attendance({
            studentId: new mongoose.Types.ObjectId(studentId),
            status,
            date: new Date(),
          });

          //for testing
          console.log('Attendance Data step 5.2'+attendanceRecord.date);
          console.log('Attendance Data step 5.2'+attendanceRecord.status);
          console.log('Attendance Data step 5.2'+attendanceRecord.studentId);

          const savedRecord = await attendanceRecord.save();

          attendanceRecords.push(savedRecord);
        } catch (err) {
          console.error(`Failed to save attendance for student ${studentId}:`, err.message);
        }
      }
      console.log('Attendance Data step 6');
  
      if (attendanceRecords.length === 0) {
        return res.status(500).json({ message: 'Failed to mark attendance. Please check the data.' });
      }
      console.log('Attendance Data step 7');
  
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
      res.status(500).json({ message: 'Failed to mark attendance.', error: err.message });
    }
  });
  
 
  
  
 
  

module.exports = router;
