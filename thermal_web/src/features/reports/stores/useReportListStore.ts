import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useLoadState } from '@/shared/composables/useLoadState'
import type { Report, ReportStatus } from '@/shared/types/domain'

export type ReportFilter = 'all' | ReportStatus

export const useReportListStore = defineStore('report-list', () => {
  const load = useLoadState()

  // ── state ────────────────────────────────────────
  const reports = ref<Report[]>([])
  const filter = ref<ReportFilter>('all')

  // ── derived ──────────────────────────────────────
  const filtered = computed(() =>
    filter.value === 'all'
      ? reports.value
      : reports.value.filter((r) => r.status === filter.value),
  )

  /** 사이드바 뱃지에 쓰는 미처리 건수 */
  const pendingCount = computed(
    () => reports.value.filter((r) => r.status !== '완료').length,
  )

  // ── action ───────────────────────────────────────
  function load0() {
    return load.loadOnce(fetchReports)
  }

  function selectFilter(next: ReportFilter) {
    filter.value = next
  }

  async function fetchReports() {
    // TODO: API 연동
  }

  return {
    isLoading: load.isLoading,
    error: load.error,
    reports,
    filter,
    filtered,
    pendingCount,
    load: load0,
    selectFilter,
  }
})
