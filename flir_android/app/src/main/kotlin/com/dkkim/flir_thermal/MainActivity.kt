package com.dkkim.flir_thermal

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.ui.Modifier
import com.dkkim.flir_thermal.navigation.AppNavDisplay
import com.dkkim.flir_thermal.ui.theme.FLIR_THERMALTheme
import com.flir.thermalsdk.androidsdk.ThermalSdkAndroid
import com.flir.thermalsdk.log.ThermalLog
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {

        ThermalSdkAndroid.init(this, ThermalLog.LogLevel.DEBUG)

        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            FLIR_THERMALTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    AppNavDisplay(modifier = Modifier.padding(innerPadding))
                }
            }
        }
    }
}
