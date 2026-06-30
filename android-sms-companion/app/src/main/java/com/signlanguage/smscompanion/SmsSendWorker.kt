package com.signlanguage.smscompanion

import android.Manifest
import android.app.Activity
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.Build
import android.provider.Settings
import android.telephony.SmsManager
import android.telephony.SubscriptionManager
import android.telephony.TelephonyManager
import androidx.core.content.ContextCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import org.json.JSONArray
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID

class SmsSendWorker(
    private val appContext: Context,
    params: WorkerParameters
) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val requestId = inputData.getString(KEY_REQUEST_ID).orEmpty()
        val body = inputData.getString(KEY_BODY).orEmpty()
        val recipientsJson = inputData.getString(KEY_RECIPIENTS).orEmpty()
        val callbackUrl = inputData.getString(KEY_CALLBACK_URL).orEmpty()
        val callbackToken = inputData.getString(KEY_CALLBACK_TOKEN).orEmpty()

        if (requestId.isBlank() || body.isBlank() || callbackUrl.isBlank() || callbackToken.isBlank()) {
            return@withContext Result.failure()
        }

        val recipients = parseRecipients(recipientsJson)
        val phoneError = getPhoneReadinessError()
        val statuses = if (phoneError != null) {
            recipients.map { it.toStatus(phoneError, phoneError.message) }
        } else {
            recipients.map { recipient ->
                if (!E164_REGEX.matches(recipient.phone)) {
                    recipient.toStatus("invalid_phone", "Phone number must be in E.164 format.")
                } else {
                    sendSms(recipient, body)
                }
            }
        }

        val callbackSent = postCallback(callbackUrl, callbackToken, requestId, statuses, phoneError?.code)
        if (callbackSent) Result.success() else Result.retry()
    }

    private fun parseRecipients(raw: String): List<SmsRecipient> {
        val array = JSONArray(raw)
        return List(array.length()) { index ->
            val item = array.getJSONObject(index)
            SmsRecipient(
                name = item.optString("name", "Emergency Contact"),
                phone = item.optString("phone")
            )
        }
    }

    private fun getPhoneReadinessError(): PhoneError? {
        if (ContextCompat.checkSelfPermission(appContext, Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
            return PhoneError("permission_denied", "SEND_SMS permission is not granted on the Android phone.")
        }

        val telephonyManager = appContext.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
        if (telephonyManager.simState != TelephonyManager.SIM_STATE_READY) {
            return PhoneError("no_sim", "No ready SIM card was detected.")
        }

        val airplaneMode = Settings.Global.getInt(appContext.contentResolver, Settings.Global.AIRPLANE_MODE_ON, 0) == 1
        if (airplaneMode) {
            return PhoneError("airplane_mode", "Airplane mode is enabled.")
        }

        val subscriptionId = SubscriptionManager.getDefaultSmsSubscriptionId()
        if (subscriptionId == SubscriptionManager.INVALID_SUBSCRIPTION_ID) {
            return PhoneError("no_sim", "No default SMS SIM is selected.")
        }

        return null
    }

    private suspend fun sendSms(recipient: SmsRecipient, body: String): SmsStatus {
        val subscriptionId = SubscriptionManager.getDefaultSmsSubscriptionId()
        val smsManager = SmsManager.getSmsManagerForSubscriptionId(subscriptionId)
        val parts = smsManager.divideMessage(body)
        val action = "${appContext.packageName}.SMS_SENT.${UUID.randomUUID()}"
        val completed = CompletableDeferred<SmsStatus>()
        var remainingParts = parts.size
        var firstFailure: SmsStatus? = null

        val receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                if (resultCode != Activity.RESULT_OK && firstFailure == null) {
                    firstFailure = recipient.toStatus(mapSmsResult(resultCode), "SMS send failed with result code $resultCode.")
                }

                remainingParts -= 1
                if (remainingParts <= 0 && !completed.isCompleted) {
                    completed.complete(firstFailure ?: recipient.toStatus("sent", null))
                }
            }
        }

        val filter = IntentFilter(action)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            appContext.registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            appContext.registerReceiver(receiver, filter)
        }

        return try {
            val sentIntents = parts.mapIndexed { index, _ ->
                PendingIntent.getBroadcast(
                    appContext,
                    index,
                    Intent(action).setPackage(appContext.packageName),
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
            }

            smsManager.sendMultipartTextMessage(recipient.phone, null, parts, ArrayList(sentIntents), null)

            withTimeoutOrNull(SMS_SEND_TIMEOUT_MS) {
                completed.await()
            } ?: recipient.toStatus("sms_send_timeout", "Android did not receive an SMS sent result before timeout.")
        } catch (error: SecurityException) {
            recipient.toStatus("permission_denied", error.message ?: "SEND_SMS permission denied.")
        } catch (error: IllegalArgumentException) {
            recipient.toStatus("invalid_phone", error.message ?: "Invalid phone number.")
        } catch (error: Exception) {
            recipient.toStatus("sms_send_failure", error.message ?: "SMS send failed.")
        } finally {
            runCatching { appContext.unregisterReceiver(receiver) }
        }
    }

    private fun mapSmsResult(resultCode: Int): String = when (resultCode) {
        SmsManager.RESULT_ERROR_NO_SERVICE -> "no_service"
        SmsManager.RESULT_ERROR_RADIO_OFF -> "airplane_mode"
        SmsManager.RESULT_ERROR_NULL_PDU -> "sms_null_pdu"
        SmsManager.RESULT_ERROR_GENERIC_FAILURE -> "sms_send_failure"
        else -> "sms_send_failure"
    }

    private fun postCallback(
        callbackUrl: String,
        callbackToken: String,
        requestId: String,
        statuses: List<SmsStatus>,
        phoneStatus: String?
    ): Boolean {
        val payload = JSONObject()
            .put("requestId", requestId)
            .put("phoneStatus", phoneStatus ?: "ready")
            .put("smsStatus", JSONArray(statuses.map { it.toJson() }))
            .toString()

        val connection = (URL(callbackUrl).openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = 10000
            readTimeout = 10000
            doOutput = true
            setRequestProperty("Authorization", "Bearer $callbackToken")
            setRequestProperty("Content-Type", "application/json")
        }

        return try {
            OutputStreamWriter(connection.outputStream).use { writer ->
                writer.write(payload)
            }
            connection.responseCode in 200..299
        } finally {
            connection.disconnect()
        }
    }

    private data class SmsRecipient(val name: String, val phone: String) {
        fun toStatus(status: String, error: String?) = SmsStatus(name, phone, status, error)
    }

    private data class SmsStatus(
        val contactName: String,
        val phone: String,
        val status: String,
        val error: String?
    ) {
        fun toJson(): JSONObject {
            val json = JSONObject()
                .put("contactName", contactName)
                .put("phone", phone)
                .put("status", status)
            if (!error.isNullOrBlank()) json.put("error", error)
            return json
        }
    }

    private data class PhoneError(val code: String, val message: String)

    companion object {
        const val KEY_REQUEST_ID = "requestId"
        const val KEY_BODY = "body"
        const val KEY_RECIPIENTS = "recipients"
        const val KEY_CALLBACK_URL = "callbackUrl"
        const val KEY_CALLBACK_TOKEN = "callbackToken"

        private const val SMS_SEND_TIMEOUT_MS = 30000L
        private val E164_REGEX = Regex("^\\+[1-9]\\d{7,14}$")
    }
}
