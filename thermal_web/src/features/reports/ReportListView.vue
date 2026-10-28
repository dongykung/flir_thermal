<script setup lang="ts">
import { onActivated, onMounted } from 'vue'
import { useReportListStore } from './stores/useReportListStore'

defineOptions({ name: 'ReportListView' })

const store = useReportListStore()

onMounted(store.load)
onActivated(store.load)
</script>

<template>
  <div class="scroll-y page">
    <!-- TODO: 상태 필터 + 보고서 목록 -->
    <section class="placeholder">보고서 {{ store.filtered.length }}건</section>
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
