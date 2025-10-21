const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`📡 REQUEST: ${req.method} ${req.url}`);
  next();
});


// MongoDB Connection
console.log('Attempting to connect to MongoDB...');
console.log('Using MongoDB URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/boxbus');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boxbus')
  .then(() => {
    console.log('Connected to MongoDB successfully!');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.error('Error details:', err.message);
  });

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'BoxBus App is running!' });
});

// Import routes
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const distanceRoutes = require('./routes/distance');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/distance', distanceRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

