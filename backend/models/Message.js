const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: String,
    enum: ['deaf_user', 'hearing_user'],
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'sign', 'speech', 'sos'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', MessageSchema);
