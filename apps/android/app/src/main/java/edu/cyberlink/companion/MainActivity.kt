package edu.cyberlink.companion

import android.app.Activity
import android.content.Intent
import android.media.projection.MediaProjectionManager
import android.os.Bundle
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.ComponentActivity

class MainActivity : ComponentActivity() {
    private val captureConsent = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK && result.data != null) {
            startForegroundService(Intent(this, ScreenShareService::class.java).apply {
                putExtra("resultCode", result.resultCode); putExtra("projectionData", result.data)
            })
        }
    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val layout = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(40, 80, 40, 40) }
        layout.addView(TextView(this).apply { text = "CyberLink Companion\n\nThis device shares information only after its owner approves pairing and permissions."; textSize = 18f })
        layout.addView(TextView(this).apply { text = "Pairing and account sign-in require your lab server URL and an invitation."; textSize = 14f })
        layout.addView(Button(this).apply { text = "Approve screen sharing"; setOnClickListener { val manager = getSystemService(MEDIA_PROJECTION_SERVICE) as MediaProjectionManager; captureConsent.launch(manager.createScreenCaptureIntent()) } })
        layout.addView(Button(this).apply { text = "Stop sharing"; setOnClickListener { stopService(Intent(this@MainActivity, ScreenShareService::class.java)) } })
        setContentView(layout)
    }
}
