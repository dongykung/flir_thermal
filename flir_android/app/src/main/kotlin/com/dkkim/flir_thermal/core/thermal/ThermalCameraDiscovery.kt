package com.dkkim.flir_thermal.core.thermal

import com.flir.thermalsdk.ErrorCode
import com.flir.thermalsdk.live.CommunicationInterface
import com.flir.thermalsdk.live.Identity
import com.flir.thermalsdk.live.discovery.DiscoveredCamera
import com.flir.thermalsdk.live.discovery.DiscoveryEventListener
import com.flir.thermalsdk.live.discovery.DiscoveryFactory
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ThermalCameraDiscovery @Inject constructor() {

    private val factory = DiscoveryFactory.getInstance()

    fun discover(iface: CommunicationInterface): Flow<DiscoveryEvent> = callbackFlow {
        val listener = object : DiscoveryEventListener {

            override fun onCameraFound(discoveredCamera: DiscoveredCamera) {
                trySend(
                    DiscoveryEvent.Found(
                        ThermalCameraInfo(discoveredCamera.identity, discoveredCamera.displayName)
                    )
                )
            }

            override fun onCameraLost(identity: Identity) {
                trySend(DiscoveryEvent.Lost(identity))
            }

            override fun onDiscoveryError(
                communicationInterface: CommunicationInterface,
                error: ErrorCode,
            ) {
                trySend(DiscoveryEvent.Failed("$communicationInterface → $error"))
            }

            override fun onDiscoveryFinished(communicationInterface: CommunicationInterface) {
                trySend(DiscoveryEvent.FinishedBySystem)
            }
        }

        factory.scan(listener, iface)

        awaitClose { factory.stop() }
    }
}
