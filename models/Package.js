// Package Model
const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  trackingId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sender: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  receiver: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  packageDetails: {
    type: { type: String, required: true },
    weight: { type: Number, required: true },
    fragile: { type: Boolean, default: false }
  },
  serviceType: { 
    type: String, 
    required: true,
    enum: ['Standard', 'Express', 'Same Day', 'Premium']
  },
  cost: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    required: true, 
    default: 'Pickup Scheduled',
    enum: ['Pickup Scheduled', 'In Transit', 'Out for Delivery', 'Delivered']
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  estimatedDelivery: { 
    type: Date, 
    required: true 
  },
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    location: { type: String },
    notes: { type: String }
  }]
});

// Update the updatedAt field before saving
PackageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Package', PackageSchema);