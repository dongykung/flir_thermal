import { ref } from 'vue'
import { defineStore } from 'pinia'
import { isNativeWebView } from '@/shared/lib/platform'

export type ThemeMode = 'system' | 'light' | 'dark'

export const useSettingsStore = defineStore('settings', () => {
  // ── state ────────────────────────────────────────
  const theme = ref<ThemeMode>('system')
  const pushEnabled = ref(true)
  const isNative = ref(isNativeWebView())

  // ── action ───────────────────────────────────────
  function setTheme(next: ThemeMode) {
    theme.value = next
    // TODO: localStorage 저장 + html data-theme 반영
  }

  function togglePush() {
    pushEnabled.value = !pushEnabled.value
    // TODO: 네이티브면 브릿지로 권한 요청
  }

  function logout() {
    // TODO: 세션 정리 후 로그인 화면으로
  }

  return { theme, pushEnabled, isNative, setTheme, togglePush, logout }
})
