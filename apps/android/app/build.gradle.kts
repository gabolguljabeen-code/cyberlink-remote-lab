plugins { id("com.android.application"); id("org.jetbrains.kotlin.android") }
android { namespace = "edu.cyberlink.companion"; compileSdk = 35
    defaultConfig { applicationId = "edu.cyberlink.companion"; minSdk = 26; targetSdk = 35; versionCode = 1; versionName = "0.1.0" }
}
dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.activity:activity-ktx:1.10.0")
    implementation("io.livekit:livekit-android:2.16.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
}
