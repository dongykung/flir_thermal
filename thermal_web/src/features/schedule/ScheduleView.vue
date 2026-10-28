<script setup lang="ts">
import { onActivated, onMounted } from 'vue'
import { useScheduleStore } from './stores/useScheduleStore'

defineOptions({ name: 'ScheduleView' })

const store = useScheduleStore()

onMounted(store.load)
onActivated(store.load)
</script>

<template>
  <div class="scroll-y page">
    <!-- TODO: 월 달력 + 선택일 일정 목록 -->
    <section class="placeholder">{{ store.focusedMonth }} · 일정 {{ store.items.length }}건</section>
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
