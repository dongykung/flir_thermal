package com.dkkim.flir_thermal.feature.home

import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

data class HomeUiState(
    val isScanning: Boolean = false,
    val discoveredCameras: List<String> = emptyList(),
)

@HiltViewModel
class HomeViewModel @Inject constructor() : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    // TODO: FLIR SDK 의 Discovery 를 주입받아 실제 스캔으로 교체
    fun onScanClick() {
        _uiState.value = _uiState.value.copy(isScanning = !_uiState.value.isScanning)
    }
}
