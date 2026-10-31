package edu.cyberlink.companion

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.os.IBinder

class ScreenShareService : Service() {
    private var projection: MediaProjection? = null
    override fun onCreate() {
        super.onCreate()
        val manager = getSystemService(NotificationManager::class.java)
        if (Build.VERSION.SDK_INT >= 26) manager.createNotificationChannel(NotificationChannel("screen_share", "Screen sharing", NotificationManager.IMPORTANCE_LOW))
        val notification = if (Build.VERSION.SDK_INT >= 26) Notification.Builder(this, "screen_share") else Notification.Builder(this)
        startForeground(42, notification.setContentTitle("CyberLink screen sharing is active").setContentText("Tap Stop in the companion app to end sharing.").setSmallIcon(android.R.drawable.ic_menu_view).build())
    }
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val resultCode = intent?.getIntExtra("resultCode", 0) ?: 0
        @Suppress("DEPRECATION") val data = intent?.getParcelableExtra<Intent>("projectionData")
        if (resultCode != 0 && data != null) {
            projection = (getSystemService(MEDIA_PROJECTION_SERVICE) as MediaProjectionManager).getMediaProjection(resultCode, data)
            projection?.registerCallback(object : MediaProjection.Callback() { override fun onStop() { stopSelf() } }, null)
        } else stopSelf()
        return START_NOT_STICKY
    }
    override fun onDestroy() { projection?.stop(); projection = null; super.onDestroy() }
    override fun onBind(intent: Intent?): IBinder? = null
}
