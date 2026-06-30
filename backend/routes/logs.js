const express = require('express');
const router = express.Router();
const RecognitionLog = require('../models/RecognitionLog');
const { protect } = require('../middleware/auth');

// @desc    Get user's recognition logs
// @route   GET /api/logs
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const logs = await RecognitionLog.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(100);
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Add a recognition log entry
// @route   POST /api/logs
// @access  Private
router.post('/', protect, async (req, res) => {
  const { signRecognized, confidence, signLanguageType } = req.body;

  if (!signRecognized || confidence === undefined) {
    return res.status(400).json({ success: false, message: 'Please provide sign recognized and confidence score' });
  }

  try {
    const log = await RecognitionLog.create({
      userId: req.user.id,
      signRecognized,
      confidence,
      signLanguageType: signLanguageType || 'ISL'
    });

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
