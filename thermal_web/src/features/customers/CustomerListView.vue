<script setup lang="ts">
import { onActivated, onMounted } from 'vue'
import { useCustomerListStore } from './stores/useCustomerListStore'

defineOptions({ name: 'CustomerListView' })

const store = useCustomerListStore()

onMounted(store.load)
onActivated(store.load)
</script>

<template>
  <div class="scroll-y page">
    <!-- TODO: 검색 + 수용가 목록 -->
    <section class="placeholder">담당 수용가 {{ store.filtered.length }}곳</section>
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
