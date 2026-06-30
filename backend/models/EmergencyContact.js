const mongoose = require('mongoose');

const EmergencyContactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a contact name'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    trim: true
  },
  mobileNumber: {
    type: String,
    trim: true
  },
  relationship: {
    type: String,
    required: [true, 'Please specify relationship'],
    trim: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

EmergencyContactSchema.pre('validate', function(next) {
  if (this.mobileNumber && !this.phone) {
    this.phone = this.mobileNumber;
  }
  if (this.phone && !this.mobileNumber) {
    this.mobileNumber = this.phone;
  }
  next();
});

EmergencyContactSchema.index({ userId: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('EmergencyContact', EmergencyContactSchema);
