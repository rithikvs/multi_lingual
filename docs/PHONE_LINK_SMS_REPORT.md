# Phone Link SMS Integration Report

## Result

Microsoft Phone Link integration for third-party programmatic SMS sending is not officially supported.

The project therefore keeps the existing Twilio-based SMS implementation. Twilio remains responsible for:

- SOS messages
- Sign-to-Text messages
- Speech-to-Text messages
- Google Maps location links in SMS bodies
- Multiple recipient delivery attempts
- Per-recipient delivery status returned by the backend

## APIs Checked

The following Microsoft surfaces were checked for an official way to send SMS through a connected Android phone:

- Microsoft Phone Link public developer API or SDK: no official SMS send API was found.
- Microsoft Phone Link URI scheme: no official documented `Phone Link` URI scheme was found for composing or sending SMS.
- Windows URI launching APIs: `Windows.System.Launcher.LaunchUriAsync` can launch registered URI handlers, but it cannot silently send SMS through Phone Link. Microsoft documents that URI launching keeps the user in control and launches another app rather than providing automation.
- Windows built-in messaging URI schemes: `ms-chat:` can open the Windows Messaging app with addresses/body, but this is not documented as Phone Link SMS automation and does not provide silent send or delivery status from an Android SIM.
- Windows reserved URI schemes: Microsoft documents reserved schemes that third-party apps cannot claim or override; no Phone Link SMS automation scheme is exposed there.
- Microsoft Graph communications APIs: these cover cloud communications such as calls/online meetings, not sending carrier SMS through Phone Link or an Android SIM.
- COM / Windows API / automation interfaces: no official Phone Link SMS COM, WinRT, REST, or local automation API was found.

## Why Phone Link Cannot Be Used Here

Phone Link is a consumer UI that lets a signed-in Windows user view and send messages manually from the Phone Link app. Microsoft does not expose a supported API that lets this project submit SMS messages to Phone Link, choose recipients, send without user interaction, or read delivery status.

Because there is no official API, the project must not use unsupported methods such as:

- UI automation
- simulated clicks
- OCR
- AutoHotkey
- Power Automate Desktop flows
- screen scraping

Those methods would be brittle, unsafe for emergency messaging, and outside Microsoft's supported developer surface.

## Final Implementation Used

No Phone Link integration was added.

The backend still sends SMS through the existing Twilio utility in `backend/utils/sms.js`. A code comment was added there explaining that Phone Link does not provide an official third-party SMS automation API.

## Minimum Change Needed To Send From Your Own Android SIM

To make recipients see your own mobile number, build a small Android companion app and pair it with this project:

1. Create an Android app installed on your phone.
2. Give it the Android `SEND_SMS` permission, with runtime permission handling.
3. Expose a secure local or cloud endpoint, for example Firebase Cloud Messaging, HTTPS polling, or WebSocket.
4. From this web/backend project, send the SMS payload to the companion app.
5. The Android app sends the SMS using `SmsManager` from the phone's SIM.
6. The Android app reports queued/sent/failed status back to the backend.

This is the supported architecture when the sender must be your actual mobile SIM number.

## Reference Links

- Microsoft Phone Link help: https://support.microsoft.com/en-us/phone-link
- Windows URI launching: https://learn.microsoft.com/en-us/windows/apps/develop/launch/launch-default-app
- Windows reserved URI scheme names: https://learn.microsoft.com/en-us/windows/apps/develop/launch/reserved-uri-scheme-names
- Microsoft Graph cloud communications APIs: https://learn.microsoft.com/en-us/graph/cloud-communications-concept-overview
- Android `SmsManager`: https://developer.android.com/reference/android/telephony/SmsManager
