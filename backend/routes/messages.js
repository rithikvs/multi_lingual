const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');
const { sendSmsBatch } = require('../utils/sms');
const { buildSmsRecipients, getRegisteredMobile } = require('../utils/recipients');

const validateCoordinates = (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  return { latitude: lat, longitude: lng };
};

// @desc    Get user's chat messages/history
// @route   GET /api/messages
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.user.id })
      .sort({ timestamp: 1 })
      .limit(200); // return last 200 messages
    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Save a new chat message
// @route   POST /api/messages
// @access  Private
router.post('/', protect, async (req, res) => {
  const { sender, messageType, content } = req.body;

  if (!sender || !messageType || !content) {
    return res.status(400).json({ success: false, message: 'Please provide sender, messageType and content' });
  }

  try {
    const msg = await Message.create({
      userId: req.user.id,
      sender,
      messageType,
      content
    });

    res.status(201).json({ success: true, data: msg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Share recognized communication text through SMS
// @route   POST /api/messages/send
// @access  Private
router.post('/send', protect, async (req, res) => {
  const { text, messageType, latitude, longitude } = req.body;
  const coordinates = validateCoordinates(latitude, longitude);

  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Recognized text is required.' });
  }

  if (!coordinates) {
    return res.status(400).json({ success: false, message: 'Valid GPS coordinates are required.' });
  }

  try {
    const recipients = await buildSmsRecipients({ user: req.user });

    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Add at least one active contact or set REGISTERED_MOBILE_NUMBER in backend/.env to send SMS.'
      });
    }

    const registeredMobile = getRegisteredMobile(req.user);
    const mapsLink = `https://maps.google.com/?q=${coordinates.latitude},${coordinates.longitude}`;
    const body = [
      'Recognized Message:',
      `"${text.trim()}"`,
      '',
      `From Mobile: ${registeredMobile || 'Not configured'}`,
      '',
      'Current Location:',
      mapsLink
    ].join('\n');

    const smsResult = await sendSmsBatch({ recipients, body });
    const savedMessage = await Message.create({
      userId: req.user.id,
      sender: messageType === 'speech' ? 'hearing_user' : 'deaf_user',
      messageType: ['speech', 'sign', 'text'].includes(messageType) ? messageType : 'text',
      content: text.trim()
    });

    res.status(200).json({
      success: true,
      message: smsResult.deliveryFailed
        ? 'Message saved, but one or more SMS deliveries failed.'
        : 'Message saved and SMS delivery processed.',
      mapsLink,
      data: savedMessage,
      ...smsResult
    });
  } catch (error) {
    console.error('Message SMS dispatch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Clear message history
// @route   DELETE /api/messages
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    await Message.deleteMany({ userId: req.user.id });
    res.status(200).json({ success: true, message: 'Message history cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
