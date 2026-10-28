<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { navItems } from '@/router'
import { useAppShellStore } from '../stores/useAppShellStore'
import AppIcon from '@/shared/ui/AppIcon.vue'

const shell = useAppShellStore()
</script>

<template>
  <nav class="sidebar">
    <div class="brand">
      <span class="logo"><AppIcon name="bolt" :size="17" /></span>
      <span class="brand-name">전기안전관리</span>
    </div>

    <ul class="tabs">
      <li v-for="item in navItems" :key="item.routeName">
        <RouterLink class="tab" :to="{ name: item.routeName }">
          <AppIcon :name="item.icon" :size="18" />
          <span class="label">{{ item.label }}</span>
          <span v-if="item.badgeKey && shell.badges[item.badgeKey] > 0" class="badge">
            {{ shell.badges[item.badgeKey] }}
          </span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.sidebar {
  width: 196px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  background: var(--bg-surface);
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
  padding-left: var(--safe-left);
  display: flex;
  flex-direction: column;
}

.brand {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 18px 16px;
  font-weight: 600;
  color: var(--text-strong);
}

.logo {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: var(--brand);
  color: var(--text-on-brand);
}

.brand-name {
  font-size: 14px;
}

.tabs {
  list-style: none;
  margin: 0;
  padding: 4px 10px;
  display: grid;
  gap: 2px;
}

.tab {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-control);
  color: var(--text-dim);
  text-decoration: none;
  font-size: 14px;
}

.tab:hover {
  background: var(--bg-muted);
}

/* vue-router가 활성 탭에 붙여주는 클래스 */
.tab.router-link-active {
  background: var(--brand-subtle-bg);
  color: var(--brand-subtle-text);
  font-weight: 600;
}

.label {
  flex: 1;
}

.badge {
  min-width: 19px;
  height: 19px;
  padding: 0 6px;
  border-radius: 10px;
  background: var(--bg-muted);
  color: var(--text-dim);
  font-size: 11px;
  font-weight: 600;
  display: grid;
  place-items: center;
}

.tab.router-link-active .badge {
  background: var(--blue-100);
  color: var(--brand-subtle-text);
}
</style>
