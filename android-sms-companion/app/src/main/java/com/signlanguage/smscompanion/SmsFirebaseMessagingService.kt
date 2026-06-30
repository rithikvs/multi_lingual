package com.signlanguage.smscompanion

import androidx.work.Data
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class SmsFirebaseMessagingService : FirebaseMessagingService() {
    override fun onMessageReceived(message: RemoteMessage) {
        val data = message.data
        if (data["type"] != "SEND_SMS_BATCH") return

        val workData = Data.Builder()
            .putString(SmsSendWorker.KEY_REQUEST_ID, data["requestId"])
            .putString(SmsSendWorker.KEY_BODY, data["body"])
            .putString(SmsSendWorker.KEY_RECIPIENTS, data["recipients"])
            .putString(SmsSendWorker.KEY_CALLBACK_URL, data["callbackUrl"])
            .putString(SmsSendWorker.KEY_CALLBACK_TOKEN, data["callbackToken"])
            .build()

        val request = OneTimeWorkRequestBuilder<SmsSendWorker>()
            .setInputData(workData)
            .build()

        WorkManager.getInstance(applicationContext).enqueue(request)
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Open the app and copy the refreshed token into ANDROID_SMS_FCM_TOKEN.
    }
}
