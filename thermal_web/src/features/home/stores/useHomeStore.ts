import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useLoadState } from '@/shared/composables/useLoadState'
import type {
  Inspection,
  OngoingInspection,
  Report,
  ReportStatus,
} from '@/shared/types/domain'

export type TodoFilter = 'week' | 'month'

export interface TodoInspection extends Inspection {
  isToday: boolean
}

/** TODO: API 연동 시 제거. 점검 화면 연결 확인용 목데이터 */
const MOCK_ONGOING: OngoingInspection = {
  id: 'insp-20251013-jeongok',
  siteName: '전곡동',
  region: '경기 연천',
  dueDate: '2025-10-13',
  round: '3/4',
  cycle: '반기',
  startedAt: '2025-10-13',
  savedAt: '14:32',
}

/**
 * 홈 화면의 상태와 로직.
 * View는 상태를 들고 있지 않고 여기서 읽기만 한다. (state / derived / action)
 */
export const useHomeStore = defineStore('home', () => {
  const load = useLoadState()

  // ── state ────────────────────────────────────────
  const recheckRequests = ref<Inspection[]>([])
  const ongoing = ref<OngoingInspection | null>(MOCK_ONGOING)
  const todos = ref<TodoInspection[]>([])
  const reports = ref<Report[]>([])
  const notices = ref<string[]>([])
  const todoFilter = ref<TodoFilter>('week')

  // ── derived (View에서 계산하지 않는다) ───────────
  const visibleTodos = computed(() =>
    todoFilter.value === 'week'
      ? todos.value.filter((t) => t.isToday || isThisWeek(t.dueDate))
      : todos.value,
  )

  const reportCounts = computed<Record<ReportStatus, number>>(() => ({
    점검중: countBy(reports.value, '점검중'),
    검토중: countBy(reports.value, '검토중'),
    재점검: countBy(reports.value, '재점검'),
    완료: countBy(reports.value, '완료'),
  }))

  // ── action (View는 이것만 호출한다) ──────────────
  /** View의 onMounted/onActivated에서 호출. 최초 1회만 실제 로드된다 */
  function load0() {
    return load.loadOnce(fetchAll)
  }

  function refresh() {
    return load.reload(fetchAll)
  }

  function selectTodoFilter(filter: TodoFilter) {
    todoFilter.value = filter
  }

  async function fetchAll() {
    // TODO: API 연동. 현재는 구조만.
  }

  return {
    isLoading: load.isLoading,
    error: load.error,
    recheckRequests,
    ongoing,
    todos,
    reports,
    notices,
    todoFilter,
    visibleTodos,
    reportCounts,
    load: load0,
    refresh,
    selectTodoFilter,
  }
})

function countBy(list: Report[], status: ReportStatus) {
  return list.filter((r) => r.status === status).length
}

function isThisWeek(_date: string) {
  // TODO: 주차 계산
  return true
}
