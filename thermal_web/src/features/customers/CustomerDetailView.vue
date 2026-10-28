<script setup lang="ts">
defineOptions({ name: 'CustomerDetailView' })

// 상세는 KeepAlive 대상이 아니라서 store를 두지 않고
// 라우트 파라미터로 매번 새로 로드한다.
defineProps<{ id: string }>()
</script>

<template>
  <div class="scroll-y page">
    <section class="placeholder">수용가 상세 #{{ id }}</section>
  </div>
</template>

<style scoped>
.page {
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
