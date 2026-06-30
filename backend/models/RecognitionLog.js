const mongoose = require('mongoose');

const RecognitionLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  signRecognized: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  signLanguageType: {
    type: String,
    enum: ['ISL', 'ASL'],
    default: 'ISL'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RecognitionLog', RecognitionLogSchema);
