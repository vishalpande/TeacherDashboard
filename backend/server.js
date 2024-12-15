// Main server file (app.js or index.js)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan'); // Optional: for logging requests

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Can be customized with options for specific origins
app.use(express.json());
app.use(morgan('dev')); // Log incoming requests (only in development)

// Import Routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');

// Use Routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/students', studentRoutes); // Student routes (this includes /students, /attendance, /classes, etc.)

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit process with failure
  });

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Something went wrong!',
    error: err.details || err.message, // Provide additional error details if available
  });
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
