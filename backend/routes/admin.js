const express = require('express');
const router = express.Router();
const User = require('../models/User');
const EmergencyContact = require('../models/EmergencyContact');
const RecognitionLog = require('../models/RecognitionLog');
const Message = require('../models/Message');
const { protect, authorize } = require('../middleware/auth');

// Apply admin protection to all routes in this file
router.use(protect);
router.use(authorize('admin'));

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLogs = await RecognitionLog.countDocuments();
    const totalContacts = await EmergencyContact.countDocuments();
    
    // Calculate average confidence score
    const confidenceStats = await RecognitionLog.aggregate([
      {
        $group: {
          _id: null,
          avgConfidence: { $avg: '$confidence' }
        }
      }
    ]);
    const avgConfidence = confidenceStats.length > 0 ? confidenceStats[0].avgConfidence : 0;

    // Count SOS alerts sent (messageType: 'sos')
    const totalSOSAlerts = await Message.countDocuments({ messageType: 'sos' });

    // Activity by sign type (ISL vs ASL)
    const signTypeStats = await RecognitionLog.aggregate([
      {
        $group: {
          _id: '$signLanguageType',
          count: { $sum: 1 }
        }
      }
    ]);
    const signLanguageBreakdown = { ISL: 0, ASL: 0 };
    signTypeStats.forEach(item => {
      if (item._id) {
        signLanguageBreakdown[item._id] = item.count;
      }
    });

    // Recent logs
    const recentLogs = await RecognitionLog.find()
      .populate('userId', 'username email')
      .sort({ timestamp: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalLogs,
        totalContacts,
        avgConfidence,
        totalSOSAlerts,
        signLanguageBreakdown,
        recentLogs
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deleting oneself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
    }

    // Cascading delete related records
    await EmergencyContact.deleteMany({ userId: user._id });
    await RecognitionLog.deleteMany({ userId: user._id });
    await Message.deleteMany({ userId: user._id });
    
    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all recognition logs
// @route   GET /api/admin/logs
// @access  Private/Admin
router.get('/logs', async (req, res) => {
  try {
    const logs = await RecognitionLog.find()
      .populate('userId', 'username email')
      .sort({ timestamp: -1 });
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all emergency contacts registered in the system
// @route   GET /api/admin/contacts
// @access  Private/Admin
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await EmergencyContact.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: contacts.length, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
