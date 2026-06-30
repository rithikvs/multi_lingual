const express = require('express');
const router = express.Router();
const EmergencyContact = require('../models/EmergencyContact');
const { protect } = require('../middleware/auth');
const { normalizePhoneNumber, isValidPhoneNumber } = require('../utils/phone');

// @desc    Get all emergency contacts for logged-in user
// @route   GET /api/contacts
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({ userId: req.user.id });
    res.status(200).json({ success: true, count: contacts.length, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Add emergency contact
// @route   POST /api/contacts
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const phone = normalizePhoneNumber(req.body.phone || req.body.mobileNumber);
    if (!isValidPhoneNumber(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number must be in E.164 format, for example +919876543210.'
      });
    }

    req.body.userId = req.user.id;
    req.body.phone = phone;
    req.body.mobileNumber = phone;
    
    // If setting to primary, reset other contacts first
    if (req.body.isPrimary === true) {
      await EmergencyContact.updateMany({ userId: req.user.id }, { isPrimary: false });
    }

    const contact = await EmergencyContact.create(req.body);
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A contact with this mobile number already exists.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update emergency contact
// @route   PUT /api/contacts/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let contact = await EmergencyContact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    // Make sure contact belongs to user
    if (contact.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this contact' });
    }

    if (req.body.phone !== undefined || req.body.mobileNumber !== undefined) {
      const phone = normalizePhoneNumber(req.body.phone || req.body.mobileNumber);
      if (!isValidPhoneNumber(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number must be in E.164 format, for example +919876543210.'
        });
      }
      req.body.phone = phone;
      req.body.mobileNumber = phone;
    }

    // If setting to primary, reset other contacts first
    if (req.body.isPrimary === true) {
      await EmergencyContact.updateMany({ userId: req.user.id }, { isPrimary: false });
    }

    contact = await EmergencyContact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A contact with this mobile number already exists.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete emergency contact
// @route   DELETE /api/contacts/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const contact = await EmergencyContact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    // Make sure contact belongs to user
    if (contact.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this contact' });
    }

    await contact.deleteOne();
    res.status(200).json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Backward-compatible alias for older frontend builds.
router.post('/sos', protect, (req, res) => {
  res.redirect(307, '/api/emergency/send-sos');
});

module.exports = router;
