const crypto = require('crypto');
const path = require('path');
const admin = require('firebase-admin');
const { normalizePhoneNumber, isValidPhoneNumber } = require('./phone');
const { waitForSmsResult, cancelSmsRequest } = require('./androidSmsRequests');

let firebaseApp;

const getAndroidSmsConfig = () => {
  const fcmToken = process.env.ANDROID_SMS_FCM_TOKEN;
  const callbackBaseUrl = process.env.ANDROID_SMS_CALLBACK_BASE_URL;
  const callbackToken = process.env.ANDROID_SMS_CALLBACK_TOKEN;
  const timeoutMs = Number(process.env.ANDROID_SMS_CALLBACK_TIMEOUT_MS || 30000);

  return {
    fcmToken,
    callbackBaseUrl,
    callbackToken,
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 30000,
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    serviceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  };
};

const getFirebaseCredential = ({ serviceAccountPath, serviceAccountJson }) => {
  if (serviceAccountJson) {
    return admin.credential.cert(JSON.parse(serviceAccountJson));
  }

  if (serviceAccountPath) {
    return admin.credential.cert(require(path.resolve(process.cwd(), serviceAccountPath)));
  }

  return admin.credential.applicationDefault();
};

const getFirebaseApp = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  const config = getAndroidSmsConfig();
  firebaseApp = admin.apps.length
    ? admin.app()
    : admin.initializeApp({
        credential: getFirebaseCredential(config)
      });

  return firebaseApp;
};

const getCallbackUrl = (callbackBaseUrl) => {
  const baseUrl = callbackBaseUrl.replace(/\/+$/, '');
  return `${baseUrl}/api/android-sms/callback`;
};

const normalizeRecipients = (recipients) => {
  const normalized = recipients.map((recipient) => ({
    ...recipient,
    phone: normalizePhoneNumber(recipient.phone)
  }));

  return {
    uniqueRecipients: Array.from(
      new Map(
        normalized
          .filter((recipient) => isValidPhoneNumber(recipient.phone))
          .map((recipient) => [recipient.phone, recipient])
      ).values()
    ),
    invalidRecipients: normalized.filter((recipient) => !isValidPhoneNumber(recipient.phone))
  };
};

const buildFailedStatuses = (recipients, error) => recipients.map((recipient) => ({
  contactName: recipient.name,
  phone: recipient.phone,
  status: 'failed',
  error
}));

const sendSmsBatch = async ({ recipients, body }) => {
  const { uniqueRecipients, invalidRecipients } = normalizeRecipients(recipients);
  const config = getAndroidSmsConfig();

  if (uniqueRecipients.length === 0) {
    return {
      isSimulated: false,
      smsStatus: [],
      invalidRecipients
    };
  }

  if (!config.fcmToken || !config.callbackBaseUrl || !config.callbackToken) {
    const error = 'Android SMS is not configured. Set ANDROID_SMS_FCM_TOKEN, ANDROID_SMS_CALLBACK_BASE_URL, and ANDROID_SMS_CALLBACK_TOKEN.';
    return {
      isSimulated: false,
      smsStatus: buildFailedStatuses(uniqueRecipients, error),
      invalidRecipients,
      deliverySucceeded: false,
      deliveryFailed: true
    };
  }

  const requestId = crypto.randomUUID();
  const callbackUrl = getCallbackUrl(config.callbackBaseUrl);
  const pendingResult = waitForSmsResult(requestId, config.timeoutMs);

  try {
    await getFirebaseApp().messaging().send({
      token: config.fcmToken,
      data: {
        type: 'SEND_SMS_BATCH',
        requestId,
        body,
        callbackUrl,
        callbackToken: config.callbackToken,
        recipients: JSON.stringify(uniqueRecipients.map((recipient) => ({
          name: recipient.name,
          phone: recipient.phone
        })))
      },
      android: {
        priority: 'high'
      }
    });
  } catch (error) {
    cancelSmsRequest(requestId);
    return {
      isSimulated: false,
      smsStatus: buildFailedStatuses(uniqueRecipients, `Could not notify Android SMS app: ${error.message}`),
      invalidRecipients,
      deliverySucceeded: false,
      deliveryFailed: true
    };
  }

  const result = await pendingResult;
  const smsStatus = result?.smsStatus?.length
    ? result.smsStatus
    : buildFailedStatuses(uniqueRecipients, 'Android phone did not report SMS results before the timeout.');

  return {
    isSimulated: false,
    requestId,
    smsStatus,
    invalidRecipients,
    deliverySucceeded: smsStatus.some((status) => status.status === 'sent'),
    deliveryFailed: smsStatus.some((status) => status.status !== 'sent')
  };
};

const verifyAndroidSmsConnection = async () => {
  const config = getAndroidSmsConfig();
  const missing = [];

  if (!config.fcmToken) missing.push('ANDROID_SMS_FCM_TOKEN');
  if (!config.callbackBaseUrl) missing.push('ANDROID_SMS_CALLBACK_BASE_URL');
  if (!config.callbackToken) missing.push('ANDROID_SMS_CALLBACK_TOKEN');

  if (missing.length > 0) {
    console.log(`Android SMS: not configured. Missing ${missing.join(', ')}.`);
    return;
  }

  try {
    getFirebaseApp();
    console.log('Android SMS: Firebase Admin initialized. SOS messages will be sent through the paired Android phone SIM.');
  } catch (error) {
    console.error(`Android SMS setup failed: ${error.message}`);
  }
};

module.exports = {
  sendSmsBatch,
  verifyAndroidSmsConnection
};
