import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { isNativeWebView } from '@/shared/lib/platform'
import { useReportListStore } from '@/features/reports/stores/useReportListStore'
import type { BadgeKey } from '@/shared/types/route'

/** 사이드바/헤더처럼 화면 전체에 걸친 상태를 담당한다 */
export const useAppShellStore = defineStore('app-shell', () => {
  const reportStore = useReportListStore()

  // ── state ────────────────────────────────────────
  const userName = ref('김안전')
  const today = ref(new Date())
  const unreadNotifications = ref(0)
  const isNative = ref(isNativeWebView())

  // ── derived ──────────────────────────────────────
  const todayLabel = computed(() => formatDate(today.value))

  /** 사이드바 탭 뱃지. nav.badgeKey 로 조회한다 */
  const badges = computed<Record<BadgeKey, number>>(() => ({
    reports: reportStore.pendingCount,
  }))

  // ── action ───────────────────────────────────────
  function openNotifications() {
    // TODO: 알림 패널
  }

  return {
    userName,
    today,
    todayLabel,
    unreadNotifications,
    isNative,
    badges,
    openNotifications,
  }
})

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function formatDate(d: Date) {
  return `${d.getMonth() + 1}월 ${d.getDate()}일(${WEEKDAYS[d.getDay()]})`
}
