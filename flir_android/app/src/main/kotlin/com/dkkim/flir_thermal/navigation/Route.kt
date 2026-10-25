package com.dkkim.flir_thermal.navigation

import androidx.navigation3.runtime.NavKey
import kotlinx.serialization.Serializable

/**
 * Navigation 3 의 목적지. 백스택은 이 키들의 리스트 그 자체이고,
 * 프로세스 사망 후 복원은 kotlinx.serialization 으로 이뤄진다.
 * 따라서 모든 목적지는 [Serializable] 이어야 한다.
 */
sealed interface Route : NavKey {

    @Serializable
    data object Home : Route

    /** 인자는 키의 프로퍼티로 그냥 들고 다닌다 — 문자열 라우트 파싱이 없다. */
    @Serializable
    data class Camera(val identityName: String) : Route
}
