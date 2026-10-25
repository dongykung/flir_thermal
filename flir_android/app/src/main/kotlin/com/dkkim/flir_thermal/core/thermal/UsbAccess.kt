package com.dkkim.flir_thermal.core.thermal

import android.content.Context
import com.flir.thermalsdk.androidsdk.live.connectivity.UsbPermissionHandler
import com.flir.thermalsdk.live.Identity
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.suspendCancellableCoroutine
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.coroutines.resume

@Singleton
class UsbAccess @Inject constructor(
    @ApplicationContext private val appContext: Context,
) {
    sealed interface Status {
        data object NotRequired : Status     // FLIR ONE 아님 (에뮬레이터 등)
        data object Granted : Status
        data object Needed : Status
    }

    sealed interface Result {
        data object Granted : Result
        data object Denied : Result
        data class Failed(val reason: String) : Result
    }

    // 요청 중 내부 BroadcastReceiver 가 유지되도록 인스턴스를 보유.
    // 생성자가 Context 를 받지 않으므로 누수 아님.
    private val handler = UsbPermissionHandler()

    fun status(identity: Identity): Status = when {
        !UsbPermissionHandler.isFlirOne(identity) -> Status.NotRequired
        UsbPermissionHandler.hasFlirOnePermission(identity, appContext) -> Status.Granted
        else -> Status.Needed
    }

    /** uiContext 는 저장하지 않고 즉시 SDK 로 넘긴다 */
    suspend fun request(identity: Identity, uiContext: Context): Result =
        suspendCancellableCoroutine { cont ->
            handler.requestFlirOnePermisson(
                identity,
                uiContext,
                object : UsbPermissionHandler.UsbPermissionListener {
                    override fun permissionGranted(identity: Identity) {
                        if (cont.isActive) cont.resume(Result.Granted)
                    }

                    override fun permissionDenied(identity: Identity) {
                        if (cont.isActive) cont.resume(Result.Denied)
                    }

                    override fun error(
                        errorType: UsbPermissionHandler.UsbPermissionListener.ErrorType?,
                        identity: Identity?,
                    ) {
                        if (cont.isActive) cont.resume(Result.Failed(errorType?.name ?: "UNKNOWN"))
                    }
                },
            )
        }
}