// MongoDB Connection Configuration
const mongoose = require('mongoose');
const fallbackStorage = require('../utils/fallbackStorage');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rjcouriers', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    fallbackStorage.setMongoAvailability(true);
    return conn;
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    console.log('Falling back to local storage mode');
    fallbackStorage.initializeFallbackStorage();
    fallbackStorage.setMongoAvailability(false);
    return null;
  }
};

module.exports = connectDB;