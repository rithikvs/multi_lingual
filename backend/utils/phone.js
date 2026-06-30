const E164_PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

const normalizePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  return phone.replace(/[\s().-]/g, '');
};

const isValidPhoneNumber = (phone) => E164_PHONE_REGEX.test(normalizePhoneNumber(phone));

module.exports = {
  E164_PHONE_REGEX,
  normalizePhoneNumber,
  isValidPhoneNumber
};
