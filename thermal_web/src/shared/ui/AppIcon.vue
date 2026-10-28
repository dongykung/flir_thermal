<script setup lang="ts">
import type { IconName } from '@/shared/types/route'

defineProps<{ name: IconName; size?: number }>()

// 단순 stroke 아이콘. 디자인 확정되면 교체.
const PATHS: Record<IconName, string> = {
  home: 'M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5',
  calendar: 'M4 6.5h16v14H4zM4 10.5h16M8.5 3.5v4M15.5 3.5v4',
  users: 'M3.5 20c0-3 2.9-5 6-5s6 2 6 5M9.5 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M17 15c2 .6 3.5 2.3 3.5 5',
  file: 'M6 3.5h8l4 4V20.5H6zM14 3.5v4h4M9 12.5h6M9 16h6',
  settings:
    'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M19.5 12c0-.6-.1-1.1-.2-1.6l2-1.5-2-3.4-2.3 1a7.6 7.6 0 0 0-2.8-1.6L13.8 2h-3.6l-.4 2.9c-1 .3-2 .9-2.8 1.6l-2.3-1-2 3.4 2 1.5a7.6 7.6 0 0 0 0 3.2l-2 1.5 2 3.4 2.3-1c.8.7 1.8 1.3 2.8 1.6l.4 2.9h3.6l.4-2.9c1-.3 2-.9 2.8-1.6l2.3 1 2-3.4-2-1.5c.1-.5.2-1 .2-1.6Z',
  bell: 'M18 16.5V11a6 6 0 1 0-12 0v5.5L4 19h16zM9.5 19a2.5 2.5 0 0 0 5 0',
  bolt: 'M13 2 4.5 13h6l-.5 9 9-11.5h-6z',
}
</script>

<template>
  <svg
    :width="size ?? 20"
    :height="size ?? 20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="PATHS[name]" />
  </svg>
</template>
