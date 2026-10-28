<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { keepAliveComponents } from '@/router'
import AppSidebar from './components/AppSidebar.vue'
import AppHeader from './components/AppHeader.vue'

const route = useRoute()
const title = computed(() => route.meta.title ?? '')
</script>

<template>
  <div class="shell">
    <AppSidebar />

    <div class="main">
      <AppHeader :title="title" />

      <RouterView v-slot="{ Component }">
        <!--
          탭 간 전환 시 상태를 유지한다. include는 컴포넌트 이름으로 매칭하며
          meta.keepAlive가 true인 라우트만 router/index.ts 에서 수집된다.
          여기 없는 화면(상세 등)은 매번 새로 mount 된다.
        -->
        <KeepAlive :include="keepAliveComponents" :max="8">
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </div>
  </div>
</template>

<style scoped>
.shell {
  flex: 1;
  min-height: 0;
  display: flex;
  background: var(--bg-page);
}

.main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  /* 헤더는 흰색, 그 아래 콘텐츠 영역은 회색 바탕 */
  background: var(--bg-page);
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
  padding-right: var(--safe-right);
}
</style>
