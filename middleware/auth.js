// Authentication Middleware
const jwt = require('jsonwebtoken');
const fallbackStorage = require('../utils/fallbackStorage');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rjcouriers-secret-key');

    // Add user from payload to request
    req.user = decoded.user;
    
    // If using fallback storage, verify that the user exists
    if (!fallbackStorage.isMongoDBAvailable()) {
      const user = fallbackStorage.findUserById(req.user.id);
      if (!user) {
        return res.status(401).json({ msg: 'User not found, authorization denied' });
      }
    }
    
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};