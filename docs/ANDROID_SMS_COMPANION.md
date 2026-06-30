# Android SMS Companion Integration

The project sends SMS through an Android companion app installed on the user's own phone.

Flow:

1. The existing frontend calls the existing backend SOS/message APIs.
2. The backend builds the SMS body and recipient list.
3. The backend sends a Firebase Cloud Messaging data message to the Android companion app.
4. The Android app sends the SMS with Android `SmsManager` from the phone's SIM card.
5. The Android app posts per-recipient success or failure results back to the backend callback endpoint.

The recipient sees the SIM phone number as the SMS sender. No third-party SMS provider, Phone Link, ADB, UI automation, or browser automation is used.

## Backend Environment

Create `backend/.env` from `backend/.env.example` and configure:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
ANDROID_SMS_FCM_TOKEN=your_android_companion_fcm_registration_token
ANDROID_SMS_CALLBACK_BASE_URL=https://your-public-backend.example.com
ANDROID_SMS_CALLBACK_TOKEN=replace_with_a_long_random_secret
ANDROID_SMS_CALLBACK_TIMEOUT_MS=30000
REGISTERED_MOBILE_NUMBER=+919876543210
```

Use either `FIREBASE_SERVICE_ACCOUNT_PATH` or `FIREBASE_SERVICE_ACCOUNT_JSON`.

`ANDROID_SMS_CALLBACK_BASE_URL` must be reachable from the Android phone. For local development, expose `localhost:5000` with a secure tunnel and use that HTTPS URL.

## Android Setup

1. Open `android-sms-companion` in Android Studio.
2. Create a Firebase Android app with package `com.signlanguage.smscompanion`.
3. Place `google-services.json` in `android-sms-companion/app/google-services.json`.
4. Install the app on the Android phone that should send SMS.
5. Open the app and grant `SEND_SMS`.
6. Copy the FCM token shown in the app to `ANDROID_SMS_FCM_TOKEN`.

## Error Handling

The Android app reports:

- `sent`
- `permission_denied`
- `no_sim`
- `airplane_mode`
- `invalid_phone`
- `no_service`
- `sms_send_timeout`
- `sms_send_failure`

The backend preserves the existing API response shape with `smsStatus`, `deliverySucceeded`, and `deliveryFailed`.
