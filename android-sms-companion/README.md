# Android SMS Companion

This app receives Firebase Cloud Messaging data messages from the existing backend and sends SMS with Android `SmsManager`.

The recipient sees the phone number of the SIM installed in this Android device. No Twilio, Phone Link, ADB, UI automation, or third-party SMS gateway is used.

## Setup

1. Create a Firebase project.
2. Add an Android app with package name `com.signlanguage.smscompanion`.
3. Download `google-services.json` from Firebase and place it at:

   ```text
   android-sms-companion/app/google-services.json
   ```

4. Open `android-sms-companion` in Android Studio.
5. Build and install the app on the Android phone that should send SMS.
6. Open the app, grant SMS permission, and copy the displayed FCM token.
7. Put that token in backend `.env` as `ANDROID_SMS_FCM_TOKEN`.
8. Keep the app installed. FCM can wake the app in the background for incoming SMS requests.

## Required Backend Public URL

The phone must be able to call the backend callback endpoint:

```text
POST <ANDROID_SMS_CALLBACK_BASE_URL>/api/android-sms/callback
```

For local development, expose the backend with a secure tunnel such as ngrok or Cloudflare Tunnel and set `ANDROID_SMS_CALLBACK_BASE_URL` to the public HTTPS URL.

## Permissions

The app requests:

- `SEND_SMS` to send SMS from the device SIM.
- `INTERNET` to receive FCM messages and call the backend callback.

## Error Statuses Returned

- `sent`
- `permission_denied`
- `no_sim`
- `airplane_mode`
- `invalid_phone`
- `no_service`
- `sms_send_timeout`
- `sms_send_failure`
