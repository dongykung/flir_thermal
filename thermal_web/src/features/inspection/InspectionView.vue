<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useInspectionStore } from './stores/useInspectionStore'

defineOptions({ name: 'InspectionView' })

const props = defineProps<{ id: string }>()

const router = useRouter()
const store = useInspectionStore()

onMounted(() => store.open(props.id))
// 점검 화면에서 다른 점검으로 바로 이동하는 경우 대비
watch(() => props.id, (id) => store.open(id))

function close() {
  router.push({ name: 'home' })
}
</script>

<template>
  <!-- 사이드바/헤더 없는 전체화면. UI는 아직 비어 있고 연결 구조만 있다 -->
  <main class="screen">
    <header class="bar">
      <button type="button" class="close" @click="close()">닫기</button>
      <span class="title">점검</span>
      <span class="spacer" />
    </header>

    <section class="body">
      <!-- TODO: 점검 항목 입력 UI -->
      <p class="label">전달받은 점검 ID</p>
      <p class="value">{{ store.inspectionId ?? props.id }}</p>
    </section>
  </main>
</template>

<style scoped>
.screen {
  background: var(--bg-page);
}

.bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
}

.close {
  background: none;
  border: none;
  padding: 4px 0;
  color: var(--text-dim);
  font-size: 14px;
}

.title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-strong);
}

.spacer {
  flex: 1;
}

.body {
  flex: 1;
  min-height: 0;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 8px;
}

.label {
  margin: 0;
  font-size: 13px;
  color: var(--text-dim);
}

.value {
  margin: 0;
  font-family: var(--mono);
  font-size: 16px;
  color: var(--text-strong);
}
</style>
