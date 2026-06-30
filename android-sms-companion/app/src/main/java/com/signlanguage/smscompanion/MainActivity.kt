package com.signlanguage.smscompanion

import android.Manifest
import android.app.Activity
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Bundle
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.firebase.messaging.FirebaseMessaging

class MainActivity : Activity() {
    private lateinit var statusView: TextView
    private lateinit var tokenView: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(32, 48, 32, 32)
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }

        statusView = TextView(this).apply {
            textSize = 16f
        }

        tokenView = TextView(this).apply {
            textSize = 14f
            setPadding(0, 24, 0, 24)
            text = "Loading FCM token..."
        }

        val permissionButton = Button(this).apply {
            text = "Grant SMS Permission"
            setOnClickListener { requestSmsPermission() }
        }

        val copyButton = Button(this).apply {
            text = "Copy FCM Token"
            setOnClickListener { copyToken() }
        }

        root.addView(statusView)
        root.addView(permissionButton)
        root.addView(tokenView)
        root.addView(copyButton)
        setContentView(root)

        refreshPermissionStatus()
        loadFcmToken()
    }

    override fun onResume() {
        super.onResume()
        refreshPermissionStatus()
    }

    private fun refreshPermissionStatus() {
        val granted = ContextCompat.checkSelfPermission(this, Manifest.permission.SEND_SMS) == PackageManager.PERMISSION_GRANTED
        statusView.text = if (granted) {
            "SMS permission granted. This phone can send SOS SMS from its SIM."
        } else {
            "SMS permission is required before SOS messages can be sent."
        }
    }

    private fun requestSmsPermission() {
        ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.SEND_SMS), SMS_PERMISSION_REQUEST)
    }

    private fun loadFcmToken() {
        FirebaseMessaging.getInstance().token
            .addOnSuccessListener { token ->
                tokenView.text = token
            }
            .addOnFailureListener { error ->
                tokenView.text = "Could not load FCM token: ${error.message}"
            }
    }

    private fun copyToken() {
        val token = tokenView.text?.toString().orEmpty()
        if (token.isBlank() || token.startsWith("Could not") || token.startsWith("Loading")) {
            Toast.makeText(this, "FCM token is not ready yet.", Toast.LENGTH_SHORT).show()
            return
        }

        val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        clipboard.setPrimaryClip(ClipData.newPlainText("Android SMS FCM Token", token))
        Toast.makeText(this, "FCM token copied.", Toast.LENGTH_SHORT).show()
    }

    companion object {
        private const val SMS_PERMISSION_REQUEST = 1001
    }
}
