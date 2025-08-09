require('dotenv').config();
const connectDB = require('./config/db');

console.log('Testing MongoDB connection...');
console.log(`Attempting to connect to: ${process.env.MONGODB_URI}`);

connectDB()
  .then(() => {
    console.log('MongoDB connection successful!');
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection test failed:', err);
    process.exit(1);
  });