const mongoose = require('mongoose');


const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['present', 'absent'] // Ensure status is either 'present' or 'absent'
  },
  date: { 
    type: Date, 
    required: true, 
    default: Date.now,
    validate: {
      validator: (value) => value instanceof Date && !isNaN(value),
      message: 'Invalid date format.'
    }
  },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true } // Optional, if tracking attendance by class
});

// Create an index on studentId and date for better performance on queries
attendanceSchema.index({ studentId: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);