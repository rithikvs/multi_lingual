const EmergencyContact = require('../models/EmergencyContact');
const { normalizePhoneNumber } = require('./phone');

const getRegisteredMobile = (user) => normalizePhoneNumber(
  process.env.REGISTERED_MOBILE_NUMBER ||
  process.env.OWNER_MOBILE_NUMBER ||
  user.mobileNumber ||
  ''
);

const getSavedContactRecipients = async (userId) => {
  const contacts = await EmergencyContact.find({
    userId,
    isActive: { $ne: false }
  }).sort({ isPrimary: -1, createdAt: -1 });

  return contacts.map((contact) => ({
    name: contact.name,
    phone: contact.phone || contact.mobileNumber
  }));
};

const buildSmsRecipients = async ({ user, includeRegisteredFallback = true }) => {
  const recipients = await getSavedContactRecipients(user.id);

  if (recipients.length > 0 || !includeRegisteredFallback) {
    return recipients;
  }

  const registeredMobile = getRegisteredMobile(user);
  return registeredMobile
    ? [{
      name: 'Registered Mobile',
      phone: registeredMobile
    }]
    : [];
};

module.exports = {
  buildSmsRecipients,
  getRegisteredMobile
};
