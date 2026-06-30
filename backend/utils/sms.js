const twilio = require('twilio');
const { normalizePhoneNumber, isValidPhoneNumber } = require('./phone');

// Microsoft Phone Link exposes SMS through its Windows UI, but Microsoft does not
// provide an official public API/SDK/URI/COM automation surface for third-party
// apps to send SMS through a connected Android phone. Keep provider-backed SMS
// here unless a supported Android companion app is added.
const getTwilioConfig = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const hasSender = Boolean(fromNumber || messagingServiceSid);
  const isConfigured = Boolean(accountSid && authToken && hasSender);
  const isMock =
    !isConfigured ||
    accountSid.includes('MOCK') ||
    accountSid.includes('XXXX') ||
    authToken.includes('MOCK') ||
    authToken.includes('XXXX');

  return { accountSid, authToken, fromNumber, messagingServiceSid, isMock };
};

const sendSmsBatch = async ({ recipients, body }) => {
  const { accountSid, authToken, fromNumber, messagingServiceSid, isMock } = getTwilioConfig();
  const uniqueRecipients = Array.from(
    new Map(
      recipients
        .map((recipient) => ({
          ...recipient,
          phone: normalizePhoneNumber(recipient.phone)
        }))
        .filter((recipient) => isValidPhoneNumber(recipient.phone))
        .map((recipient) => [recipient.phone, recipient])
    ).values()
  );

  if (uniqueRecipients.length === 0) {
    return {
      isSimulated: isMock,
      smsStatus: [],
      invalidRecipients: recipients.filter((recipient) => !isValidPhoneNumber(recipient.phone))
    };
  }

  if (isMock) {
    console.log('--- TWILIO SMS SIMULATION ---');
    console.log(`From: ${fromNumber || 'MOCK_PHONE'}`);
    console.log(`Message: ${body}`);

    return {
      isSimulated: true,
      smsStatus: uniqueRecipients.map((recipient) => {
        console.log(`Sending Mock SMS to: ${recipient.phone} (${recipient.name})`);
        return {
          contactName: recipient.name,
          phone: recipient.phone,
          status: 'simulated_success'
        };
      }),
      invalidRecipients: recipients.filter((recipient) => !isValidPhoneNumber(recipient.phone))
    };
  }

  const client = twilio(accountSid, authToken);
  const smsStatus = [];

  for (const recipient of uniqueRecipients) {
    try {
      const messagePayload = {
        body,
        to: recipient.phone
      };

      if (messagingServiceSid) {
        messagePayload.messagingServiceSid = messagingServiceSid;
      } else {
        messagePayload.from = fromNumber;
      }

      const message = await client.messages.create(messagePayload);

      smsStatus.push({
        contactName: recipient.name,
        phone: recipient.phone,
        status: 'sent',
        sid: message.sid
      });
    } catch (error) {
      console.error(`Failed to send SMS to ${recipient.name} (${recipient.phone}):`, error.message);
      smsStatus.push({
        contactName: recipient.name,
        phone: recipient.phone,
        status: 'failed',
        error: error.message
      });
    }
  }

  return {
    isSimulated: false,
    smsStatus,
    invalidRecipients: recipients.filter((recipient) => !isValidPhoneNumber(recipient.phone)),
    deliverySucceeded: smsStatus.some((status) => status.status === 'sent'),
    deliveryFailed: smsStatus.some((status) => status.status === 'failed')
  };
};

const verifyTwilioConnection = async () => {
  const { accountSid, authToken, fromNumber, messagingServiceSid, isMock } = getTwilioConfig();

  if (isMock) {
    console.log('Twilio SMS: mock/simulation mode active. Add live Twilio credentials for real SMS delivery.');
    return;
  }

  try {
    const client = twilio(accountSid, authToken);
    const account = await client.api.accounts(accountSid).fetch();
    const senderLabel = messagingServiceSid
      ? `Messaging Service ${messagingServiceSid}`
      : `phone number ${fromNumber}`;

    console.log(`Twilio Connected: account ${account.friendlyName || accountSid} using ${senderLabel}`);
  } catch (error) {
    console.error(`Twilio Connection Failed: ${error.message}`);
  }
};

module.exports = {
  sendSmsBatch,
  verifyTwilioConnection
};
