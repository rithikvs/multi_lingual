const express = require('express');
const router = express.Router();
const EmergencyContact = require('../models/EmergencyContact');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');
const { normalizePhoneNumber, isValidPhoneNumber } = require('../utils/phone');
const { sendSmsBatch } = require('../utils/sms');
const { buildSmsRecipients, getRegisteredMobile } = require('../utils/recipients');

const getMapsLink = (latitude, longitude) => `https://maps.google.com/?q=${latitude},${longitude}`;

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

const handleDuplicateError = (error, res) => {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'A contact with this mobile number already exists.'
    });
  }

  return res.status(500).json({ success: false, message: error.message });
};

// @desc    Get emergency contacts
// @route   GET /api/emergency/contacts
// @access  Private
router.get('/contacts', protect, async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: contacts.length, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Add emergency contact
// @route   POST /api/emergency/contacts
// @access  Private
router.post('/contacts', protect, async (req, res) => {
  const phone = normalizePhoneNumber(req.body.phone || req.body.mobileNumber);

  if (!isValidPhoneNumber(phone)) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number must be in E.164 format, for example +919876543210.'
    });
  }

  try {
    const contact = await EmergencyContact.create({
      userId: req.user.id,
      name: req.body.name,
      phone,
      mobileNumber: phone,
      relationship: req.body.relationship,
      isPrimary: Boolean(req.body.isPrimary),
      isActive: req.body.isActive !== false
    });

    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    return handleDuplicateError(error, res);
  }
});

// @desc    Update emergency contact
// @route   PUT /api/emergency/contacts/:id
// @access  Private
router.put('/contacts/:id', protect, async (req, res) => {
  try {
    const existing = await EmergencyContact.findOne({ _id: req.params.id, userId: req.user.id });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    const fieldsToUpdate = {};
    ['name', 'relationship'].forEach((field) => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    if (req.body.phone !== undefined || req.body.mobileNumber !== undefined) {
      const phone = normalizePhoneNumber(req.body.phone || req.body.mobileNumber);
      if (!isValidPhoneNumber(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number must be in E.164 format, for example +919876543210.'
        });
      }
      fieldsToUpdate.phone = phone;
      fieldsToUpdate.mobileNumber = phone;
    }

    if (req.body.isPrimary !== undefined) {
      fieldsToUpdate.isPrimary = Boolean(req.body.isPrimary);
    }
    if (req.body.isActive !== undefined) {
      fieldsToUpdate.isActive = Boolean(req.body.isActive);
    }

    const contact = await EmergencyContact.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    return handleDuplicateError(error, res);
  }
});

// @desc    Delete emergency contact
// @route   DELETE /api/emergency/contacts/:id
// @access  Private
router.delete('/contacts/:id', protect, async (req, res) => {
  try {
    const contact = await EmergencyContact.findOne({ _id: req.params.id, userId: req.user.id });
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    await contact.deleteOne();
    res.status(200).json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Send GPS-based SOS alert
// @route   POST /api/emergency/send-sos
// @access  Private
router.post('/send-sos', protect, async (req, res) => {
  const coordinates = validateCoordinates(req.body.latitude, req.body.longitude);
  if (!coordinates) {
    return res.status(400).json({ success: false, message: 'Valid GPS coordinates are required.' });
  }

  try {
    const recipients = await buildSmsRecipients({ user: req.user });

    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Add at least one active contact or set REGISTERED_MOBILE_NUMBER in backend/.env to send SOS SMS.'
      });
    }

    const registeredMobile = getRegisteredMobile(req.user);
    const mapsLink = getMapsLink(coordinates.latitude, coordinates.longitude);
    const timestamp = new Date();
    const body = [
      'EMERGENCY ALERT',
      '',
      'The user requires immediate assistance.',
      '',
      `From Mobile: ${registeredMobile || 'Not configured'}`,
      '',
      'Current Location:',
      mapsLink,
      '',
      `Time: ${timestamp.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
      '',
      'Please respond immediately.'
    ].join('\n');

    const smsResult = await sendSmsBatch({ recipients, body });

    await Message.create({
      userId: req.user.id,
      sender: 'deaf_user',
      messageType: 'sos',
      content: `[ALERT] SOS sent. Location: ${mapsLink}. Time: ${timestamp.toISOString()}`
    });

    res.status(200).json({
      success: true,
      message: smsResult.deliveryFailed
        ? 'SOS saved, but one or more SMS deliveries failed.'
        : 'SOS alert processed.',
      mapsLink,
      timestamp,
      ...smsResult
    });
  } catch (error) {
    console.error('SOS dispatch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
