package com.dkkim.flir_thermal.core.thermal

sealed interface UsbPermission {
    data object Unknown : UsbPermission        // 아직 판정 전
    data object NotRequired : UsbPermission    // FLIR ONE 아님 (에뮬레이터 등)
    data object Granted : UsbPermission
    data object Needed : UsbPermission         // 요청해야 함
    data object Requesting : UsbPermission     // 다이얼로그 떠 있음
    data object Denied : UsbPermission
    data class Failed(val reason: String) : UsbPermission
}