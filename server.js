const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB()
  .then(connection => {
    if (connection) {
      console.log('MongoDB connected successfully');
    } else {
      console.log('Running in fallback mode with local storage');
    }
  })
  .catch(err => {
    console.error('MongoDB connection failed, but server will continue running');
    console.error(err);
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Define Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/packages', require('./routes/packages'));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));