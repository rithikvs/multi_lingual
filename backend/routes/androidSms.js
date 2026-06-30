const express = require('express');
const router = express.Router();
const { completeSmsRequest } = require('../utils/androidSmsRequests');

const getBearerToken = (req) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' ? token : null;
};

router.post('/callback', (req, res) => {
  const expectedToken = process.env.ANDROID_SMS_CALLBACK_TOKEN;
  const receivedToken = getBearerToken(req);

  if (!expectedToken || receivedToken !== expectedToken) {
    return res.status(401).json({ success: false, message: 'Unauthorized Android SMS callback.' });
  }

  const { requestId, smsStatus } = req.body;

  if (!requestId || !Array.isArray(smsStatus)) {
    return res.status(400).json({ success: false, message: 'requestId and smsStatus are required.' });
  }

  const completed = completeSmsRequest(requestId, {
    smsStatus,
    phoneStatus: req.body.phoneStatus || null
  });

  if (!completed) {
    return res.status(404).json({ success: false, message: 'SMS request is no longer pending.' });
  }

  return res.status(200).json({ success: true });
});

module.exports = router;
