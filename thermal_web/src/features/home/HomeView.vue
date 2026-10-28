<script setup lang="ts">
import { onActivated, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHomeStore } from './stores/useHomeStore'

// KeepAlive include 매칭용. routes.ts 의 meta.componentName 과 같아야 한다.
defineOptions({ name: 'HomeView' })

const router = useRouter()
const store = useHomeStore()

onMounted(store.load)
// KeepAlive로 살아난 뒤 재진입 — loadOnce라 중복 호출은 무시된다
onActivated(store.load)

/** 점검 수행 화면으로 점검 id를 넘긴다 (사이드바 없는 전체화면) */
function openInspection(id: string) {
  router.push({ name: 'inspection', params: { id } })
}
</script>

<template>
  <div class="scroll-y page">
    <!-- TODO: 재점검 요청 -->
    <section class="placeholder">재점검 요청 {{ store.recheckRequests.length }}</section>

    <!-- 진행 중 점검 — 점검 화면으로 넘어가는 진입점 -->
    <section v-if="store.ongoing" class="card ongoing">
      <div class="info">
        <p class="name">
          {{ store.ongoing.siteName }}
          <span class="cycle">{{ store.ongoing.cycle }}</span>
        </p>
        <p class="sub">
          이번 달 {{ store.ongoing.round }}차 · {{ store.ongoing.startedAt }} 시작 ·
          {{ store.ongoing.savedAt }} 저장
        </p>
      </div>
      <button type="button" class="primary" @click="openInspection(store.ongoing.id)">
        이어하기
      </button>
    </section>

    <!-- TODO: 해야 할 점검 / 보고서 상태 / 알림 -->
    <section class="placeholder">
      해야 할 점검 ({{ store.todoFilter === 'week' ? '이번 주' : '이번 달' }})
      {{ store.visibleTodos.length }}
    </section>
    <section class="placeholder">보고서 상태 {{ store.reportCounts.완료 }} 완료</section>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  gap: 16px;
  padding: 20px;
  align-content: start;
}

.placeholder {
  padding: 24px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  color: var(--text-dim);
}

.ongoing {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
}

.info {
  flex: 1;
  min-width: 0;
}

.name {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-strong);
}

.cycle {
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--brand-strong);
  color: var(--text-on-brand);
  font-size: 11px;
  font-weight: 600;
}

.sub {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--text-dim);
}

.primary {
  flex-shrink: 0;
  padding: 10px 18px;
  border: none;
  border-radius: var(--radius-control);
  background: var(--brand-strong);
  color: var(--text-on-brand);
  font-size: 14px;
  font-weight: 600;
}
</style>
