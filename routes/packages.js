// Package Routes
const express = require('express');
const router = express.Router();
const Package = require('../models/Package');
const auth = require('../middleware/auth');
const fallbackStorage = require('../utils/fallbackStorage');

router.post('/', auth, async (req, res) => {
  const { sender, receiver, packageDetails, serviceType } = req.body;

  try {
    if (fallbackStorage.isMongoDBAvailable()) {
  
      const counter = await Package.countDocuments() + 1;
      const trackingId = `RJC${new Date().toISOString().slice(0,10).replace(/-/g,'')}${counter.toString().padStart(3, '0')}`;
      const serviceMultipliers = {
        'Standard': 1.0,
        'Express': 1.5,
        'Same Day': 2.0,
        'Premium': 2.5
      };

      const baseRate = 50;
      const perKg = 25;
      const minimumCharge = 100;
      const fragileHandlingFee = packageDetails.fragile ? 25 : 0;

      let baseCost = baseRate + (packageDetails.weight * perKg) + fragileHandlingFee;
      const totalCost = baseCost * serviceMultipliers[serviceType];
      const cost = Math.max(totalCost, minimumCharge);

      const estimatedHours = {
        'Standard': 120,
        'Express': 48,
        'Same Day': 8,
        'Premium': 24
      };

      const estimatedDelivery = new Date();
      estimatedDelivery.setHours(estimatedDelivery.getHours() + estimatedHours[serviceType]);
      const newPackage = new Package({
        trackingId,
        customerId: req.user.id,
        sender,
        receiver,
        packageDetails,
        serviceType,
        cost,
        status: 'Pickup Scheduled',
        estimatedDelivery,
        statusHistory: [{
          status: 'Pickup Scheduled',
          timestamp: new Date(),
          location: sender.address.split(',').pop().trim(),
          notes: 'Package scheduled for pickup'
        }]
      });

      await newPackage.save();
      res.json(newPackage);
    } else {
      const trackingId = `RJC${new Date().toISOString().slice(0,10).replace(/-/g,'')}${Math.floor(1000 + Math.random() * 9000)}`;

      const serviceMultipliers = {
        'Standard': 1.0,
        'Express': 1.5,
        'Same Day': 2.0,
        'Premium': 2.5
      };

      const baseRate = 50;
      const perKg = 25;
      const minimumCharge = 100;
      const fragileHandlingFee = packageDetails.fragile ? 25 : 0;

      let baseCost = baseRate + (packageDetails.weight * perKg) + fragileHandlingFee;
      const totalCost = baseCost * serviceMultipliers[serviceType];
      const cost = Math.max(totalCost, minimumCharge);

      const estimatedHours = {
        'Standard': 120,
        'Express': 48,
        'Same Day': 8,
        'Premium': 24
      };

      const estimatedDelivery = new Date();
      estimatedDelivery.setHours(estimatedDelivery.getHours() + estimatedHours[serviceType]);
      
      const newPackage = {
        id: Date.now().toString(),
        trackingId,
        customerId: req.user.id,
        sender,
        receiver,
        packageDetails,
        serviceType,
        cost,
        status: 'Pickup Scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedDelivery: estimatedDelivery.toISOString(),
        statusHistory: [{
          status: 'Pickup Scheduled',
          timestamp: new Date().toISOString(),
          location: sender.address.split(',').pop().trim(),
          notes: 'Package scheduled for pickup'
        }]
      };
      
      const savedPackage = fallbackStorage.savePackage(newPackage);
      
      res.json(savedPackage);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/', auth, async (req, res) => {
  try {
    if (fallbackStorage.isMongoDBAvailable()) {
      const packages = await Package.find({ customerId: req.user.id }).sort({ createdAt: -1 });
      res.json(packages);
    } else {
      const packages = fallbackStorage.findPackagesByCustomerId(req.user.id);
      packages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      res.json(packages);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/track/:trackingId', async (req, res) => {
  try {
    let package;
    
    if (fallbackStorage.isMongoDBAvailable()) {
      package = await Package.findOne({ trackingId: req.params.trackingId });
    } else {
      package = fallbackStorage.findPackageByTrackingId(req.params.trackingId);
    }
    
    if (!package) {
      return res.status(404).json({ msg: 'Package not found' });
    }
    res.json(package);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    let package;
    
    if (fallbackStorage.isMongoDBAvailable()) {

      package = await Package.findById(req.params.id);
    } else {

      package = fallbackStorage.findPackageById(req.params.id);
    }
    
    if (!package) {
      return res.status(404).json({ msg: 'Package not found' });
    }

    if (package.customerId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(package);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;