package com.dkkim.flir_thermal.feature.camera

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.dkkim.flir_thermal.core.thermal.UsbPermission

@Composable
fun CameraScreen(
    identityName: String,
    modifier: Modifier = Modifier,
    viewModel: CameraViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current          // Activity context

    LaunchedEffect(uiState.permission) {
        if (uiState.permission is UsbPermission.Needed) {
            viewModel.requestUsbPermission(context)
        }
    }


    Column(
        modifier = modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        if (uiState.selected == null) {
            // 기존 목록 코드. Card 에 clickable 추가:
            uiState.cameras.forEach { cam ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { viewModel.onCameraSelected(cam) }
                ) {
                    Column(Modifier.padding(12.dp)) {
                        Text(cam.displayName, style = MaterialTheme.typography.titleMedium)
                        // Stage 1 확인용 — 나중에 지우면 됨
                        Text("interface: ${cam.identity.communicationInterface}")
                        Text("type: ${cam.identity.cameraType}")
                        Text("deviceId: ${cam.identity.deviceId}")
                    }
                }
            }
        }
        uiState.selected?.let { cam ->
            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp)) {
                    Text(cam.displayName, style = MaterialTheme.typography.titleMedium)

                    Spacer(Modifier.height(8.dp))
                    Text("isFlirOne = ${uiState.rawIsFlirOne}")
                    Text("hasFlirOnePermission = ${uiState.rawHasPermission}")
                    Spacer(Modifier.height(12.dp))

                    when (val p = uiState.permission) {
                        UsbPermission.NotRequired ->
                            Text("권한 불필요 — 연결 가능")

                        UsbPermission.Granted ->
                            Text("허용됨 — 연결 가능")

                        UsbPermission.Needed, UsbPermission.Requesting ->
                            Text("USB 접근 허용을 기다리는 중…")

                        UsbPermission.Denied -> {
                            Text("거부되었습니다.", color = MaterialTheme.colorScheme.error)
                            Button(onClick = { viewModel.requestUsbPermission(context) }) {
                                Text("다시 요청")
                            }
                        }

                        is UsbPermission.Failed -> {
                            Text("오류: ${p.reason}", color = MaterialTheme.colorScheme.error)
                            Button(onClick = { viewModel.requestUsbPermission(context) }) {
                                Text("다시 요청")
                            }
                        }

                        UsbPermission.Unknown -> Unit
                    }
                }
            }

            Button(onClick = viewModel::backToScan) { Text("다시 검색") }
        }
    }
}
