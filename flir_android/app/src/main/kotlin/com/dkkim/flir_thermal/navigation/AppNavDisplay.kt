package com.dkkim.flir_thermal.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.navigation3.rememberViewModelStoreNavEntryDecorator
import androidx.navigation3.runtime.entryProvider
import androidx.navigation3.runtime.rememberNavBackStack
import androidx.navigation3.runtime.rememberSaveableStateHolderNavEntryDecorator
import androidx.navigation3.ui.NavDisplay
import com.dkkim.flir_thermal.feature.camera.CameraScreen
import com.dkkim.flir_thermal.feature.home.HomeScreen

@Composable
fun AppNavDisplay(modifier: Modifier = Modifier) {
    val backStack = rememberNavBackStack(Route.Home)

    NavDisplay(
        backStack = backStack,
        modifier = modifier,
        onBack = { backStack.removeLastOrNull() },
        entryDecorators = listOf(
            rememberSaveableStateHolderNavEntryDecorator(),
            rememberViewModelStoreNavEntryDecorator(),
        ),
        entryProvider = entryProvider {
            entry<Route.Home> {
                HomeScreen(
                    onOpenCamera = { identityName -> backStack.add(Route.Camera(identityName)) },
                )
            }
            entry<Route.Camera> { key ->
                CameraScreen(identityName = key.identityName)
            }
        },
    )
}
