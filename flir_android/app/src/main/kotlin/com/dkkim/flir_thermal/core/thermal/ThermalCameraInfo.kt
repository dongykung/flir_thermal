package com.dkkim.flir_thermal.core.thermal

import com.flir.thermalsdk.live.Identity

data class ThermalCameraInfo(
    val identity: Identity,
    val displayName: String,
)

sealed interface DiscoveryEvent {
    data class Found(val camera: ThermalCameraInfo) : DiscoveryEvent
    data class Lost(val identity: Identity) : DiscoveryEvent
    data class Failed(val message: String) : DiscoveryEvent
    data object FinishedBySystem : DiscoveryEvent
}
