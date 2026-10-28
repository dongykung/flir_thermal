<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineOptions({ name: 'NotFoundView' })
</script>

<template>
  <main class="screen center">
    <p>페이지를 찾을 수 없습니다.</p>
    <RouterLink :to="{ name: 'home' }">홈으로</RouterLink>
  </main>
</template>

<style scoped>
.center {
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-dim);
}
</style>
