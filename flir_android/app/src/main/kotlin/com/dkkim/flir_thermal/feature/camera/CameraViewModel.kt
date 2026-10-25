package com.dkkim.flir_thermal.feature.camera

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dkkim.flir_thermal.core.thermal.DiscoveryEvent
import com.dkkim.flir_thermal.core.thermal.ThermalCameraDiscovery
import com.dkkim.flir_thermal.core.thermal.ThermalCameraInfo
import com.dkkim.flir_thermal.core.thermal.UsbAccess
import com.dkkim.flir_thermal.core.thermal.UsbPermission
import com.flir.thermalsdk.androidsdk.ThermalSdkAndroid
import com.flir.thermalsdk.live.CommunicationInterface
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.cancelAndJoin
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CameraUiState(
    val sdkVersion: String = "",
    val isScanning: Boolean = false,
    val cameras: List<ThermalCameraInfo> = emptyList(),
    val error: String? = null,

    val selected: ThermalCameraInfo? = null,
    val permission: UsbPermission = UsbPermission.Unknown,
    // Stage 2 확인용 원시값 — 나중에 지움
    val rawIsFlirOne: Boolean? = null,
    val rawHasPermission: Boolean? = null,
)

// 동글 없이 테스트하려면 EMULATOR 로만 바꾸면 됨
private val SCAN_INTERFACE = CommunicationInterface.USB

@HiltViewModel
class CameraViewModel @Inject constructor(
    private val discovery: ThermalCameraDiscovery,
    private val usbAccess: UsbAccess,
) : ViewModel() {

    private val _uiState = MutableStateFlow(
        CameraUiState(sdkVersion = ThermalSdkAndroid.getVersion())
    )
    val uiState: StateFlow<CameraUiState> = _uiState.asStateFlow()

    private var scanJob: Job? = null
    private var permissionJob: Job? = null

    init {
        startScan()
    }

    fun startScan() {
        val previous = scanJob
        scanJob = viewModelScope.launch {
            // 이전 스캔이 완전히 멈출 때까지 기다린다. cancel() 은 신호만 보내므로
            // 기다리지 않고 바로 scan() 하면 ALREADY_SCANNING 이 날 수 있다.
            previous?.cancelAndJoin()

            _uiState.update {
                it.copy(isScanning = true, error = null, cameras = emptyList())
            }
            // collect 는 끝나지 않는다. 취소되면 discover 의 awaitClose 가
            // DiscoveryFactory.stop() 을 호출한다.
            discovery.discover(SCAN_INTERFACE).collect(::reduce)
        }
    }

    private fun reduce(event: DiscoveryEvent) = _uiState.update { s ->
        when (event) {
            is DiscoveryEvent.Found ->
                if (s.cameras.any { it.identity == event.camera.identity }) s
                else s.copy(cameras = s.cameras + event.camera)

            is DiscoveryEvent.Lost ->
                s.copy(cameras = s.cameras.filterNot { it.identity == event.identity })

            is DiscoveryEvent.Failed ->
                s.copy(isScanning = false, error = event.message)

            DiscoveryEvent.FinishedBySystem ->
                s.copy(isScanning = false)
        }
    }

    fun onCameraSelected(cam: ThermalCameraInfo) {
        scanJob?.cancel()
        scanJob = null

        val status = usbAccess.status(cam.identity)

        _uiState.update {
            it.copy(
                isScanning = false,
                selected = cam,
                permission = status.toUiState(),
                // status() 의 판정 근거를 되돌려 표시한다
                rawIsFlirOne = status != UsbAccess.Status.NotRequired,
                rawHasPermission = status == UsbAccess.Status.Granted,
            )
        }
    }

    /** uiContext 는 저장하지 않고 core 로 그대로 통과시킨다 — 저장하면 Activity 누수 */
    fun requestUsbPermission(uiContext: Context) {
        val cam = _uiState.value.selected ?: return
        if (_uiState.value.permission == UsbPermission.Requesting) return

        permissionJob?.cancel()
        permissionJob = viewModelScope.launch {
            _uiState.update { it.copy(permission = UsbPermission.Requesting, error = null) }

            when (val result = usbAccess.request(cam.identity, uiContext)) {
                UsbAccess.Result.Granted -> _uiState.update {
                    it.copy(permission = UsbPermission.Granted, rawHasPermission = true)
                }

                UsbAccess.Result.Denied -> _uiState.update {
                    it.copy(permission = UsbPermission.Denied)
                }

                is UsbAccess.Result.Failed -> _uiState.update {
                    it.copy(permission = UsbPermission.Failed(result.reason))
                }
            }
        }
    }

    fun backToScan() {
        permissionJob?.cancel()
        permissionJob = null

        _uiState.update {
            it.copy(
                selected = null,
                permission = UsbPermission.Unknown,
                rawIsFlirOne = null,
                rawHasPermission = null,
                error = null,
            )
        }
        startScan()
    }

    // onCleared() 불필요 — viewModelScope 취소가 awaitClose 를 타고 stop() 까지 간다
}

private fun UsbAccess.Status.toUiState(): UsbPermission = when (this) {
    UsbAccess.Status.NotRequired -> UsbPermission.NotRequired
    UsbAccess.Status.Granted -> UsbPermission.Granted
    UsbAccess.Status.Needed -> UsbPermission.Needed
}
