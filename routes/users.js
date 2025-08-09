const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const fallbackStorage = require('../utils/fallbackStorage');

router.post('/register', async (req, res) => {
  const { name, email, phone, address, password } = req.body;

  try {
    if (fallbackStorage.isMongoDBAvailable()) {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      user = new User({
        name,
        email,
        phone,
        address,
        password
      });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Create JWT token
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'rjcouriers-secret-key',
        { expiresIn: '24h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } else {
      // Fallback mode
      // Check if user already exists
      let user = fallbackStorage.findUserByEmail(email);
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create and save user
      user = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        address,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      };

      fallbackStorage.saveUser(user);

      // Create JWT token
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'rjcouriers-secret-key',
        { expiresIn: '24h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user;
    
    if (fallbackStorage.isMongoDBAvailable()) {
      // MongoDB mode
      user = await User.findOne({ email }).select('+password');
    } else {
      // Fallback mode
      user = fallbackStorage.findUserByEmail(email);
    }
    
    // Check if user exists
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'rjcouriers-secret-key',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    let user;
    
    // Check if MongoDB is available
    if (fallbackStorage.isMongoDBAvailable()) {
      // MongoDB mode
      user = await User.findById(req.user.id).select('-password');
    } else {
      // Fallback mode
      user = fallbackStorage.findUserById(req.user.id);
      if (user) {
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        user = userWithoutPassword;
      }
    }
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { name, phone, address } = req.body;

  try {
    // Check if MongoDB is available
    if (fallbackStorage.isMongoDBAvailable()) {
      // MongoDB mode
      let user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Update user fields
      user.name = name || user.name;
      user.phone = phone || user.phone;
      user.address = address || user.address;

      await user.save();
      res.json(user);
    } else {
      // Fallback mode
      let user = fallbackStorage.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Update user fields
      user.name = name || user.name;
      user.phone = phone || user.phone;
      user.address = address || user.address;
      
      fallbackStorage.saveUser(user);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;