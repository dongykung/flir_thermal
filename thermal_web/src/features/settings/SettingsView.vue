<script setup lang="ts">
import { useSettingsStore } from './stores/useSettingsStore'

defineOptions({ name: 'SettingsView' })

const store = useSettingsStore()
</script>

<template>
  <div class="scroll-y page">
    <!-- TODO: 계정 / 테마 / 알림 / 로그아웃 -->
    <section class="placeholder">
      실행 환경: {{ store.isNative ? 'Android WebView' : '웹 브라우저' }}
    </section>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  gap: 16px;
  padding: 20px;
}

.placeholder {
  padding: 24px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  color: var(--text-dim);
}
</style>
