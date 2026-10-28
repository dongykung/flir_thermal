<script setup lang="ts">
import { useAppShellStore } from '../stores/useAppShellStore'
import AppIcon from '@/shared/ui/AppIcon.vue'

defineProps<{ title: string }>()

const shell = useAppShellStore()
</script>

<template>
  <header class="header">
    <h1>{{ title }}</h1>

    <div class="right">
      <span class="meta">{{ shell.todayLabel }}</span>
      <span class="meta">{{ shell.userName }} 님</span>

      <button type="button" class="bell" @click="shell.openNotifications()">
        <AppIcon name="bell" :size="21" />
        <span v-if="shell.unreadNotifications > 0" class="dot">
          {{ shell.unreadNotifications }}
        </span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 24px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
}

h1 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text-strong);
}

.right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.meta {
  font-size: 13px;
  color: var(--text-dim);
}

.bell {
  position: relative;
  background: none;
  border: none;
  padding: 2px;
  color: var(--text-dim);
}

.dot {
  position: absolute;
  top: -3px;
  right: -5px;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: 9px;
  background: var(--danger);
  color: var(--text-on-brand);
  font-size: 10px;
  font-weight: 700;
  display: grid;
  place-items: center;
}
</style>
