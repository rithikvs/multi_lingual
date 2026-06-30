export const buildManualSmsBody = ({ body, mapsLink }) => (
  [
    body,
    mapsLink ? `Location: ${mapsLink}` : ''
  ].filter(Boolean).join('\n\n')
);

export const buildSmsUri = ({ phone, body }) => {
  const cleanPhone = String(phone || '').replace(/[\s().-]/g, '');
  return `sms:${cleanPhone}?body=${encodeURIComponent(body || '')}`;
};

export const getSelectedSmsContacts = ({ contacts, selectedContactIds }) => {
  const activeContacts = contacts.filter((contact) => contact.isActive !== false);
  const selectedContacts = activeContacts.filter((contact) => selectedContactIds.includes(contact._id));
  return selectedContacts.length > 0 ? selectedContacts : activeContacts;
};

export const toSmsStatus = (contact, status = 'ready_to_send') => ({
  contactName: contact.name,
  phone: contact.phone || contact.mobileNumber,
  status
});

export const openSmsCompose = ({ phone, body }) => {
  window.location.href = buildSmsUri({ phone, body });
};
