import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useLoadState } from '@/shared/composables/useLoadState'
import type { Inspection } from '@/shared/types/domain'

export const useScheduleStore = defineStore('schedule', () => {
  const load = useLoadState()

  // ── state ────────────────────────────────────────
  const items = ref<Inspection[]>([])
  /** 달력에서 보고 있는 월 (yyyy-MM) */
  const focusedMonth = ref(todayMonth())
  const selectedDate = ref<string | null>(null)

  // ── derived ──────────────────────────────────────
  const itemsOfSelectedDate = computed(() =>
    selectedDate.value ? items.value.filter((i) => i.dueDate === selectedDate.value) : [],
  )

  // ── action ───────────────────────────────────────
  function load0() {
    return load.loadOnce(fetchItems)
  }

  function selectDate(date: string) {
    selectedDate.value = date
  }

  function moveMonth(delta: number) {
    const [y, m] = focusedMonth.value.split('-').map(Number)
    focusedMonth.value = formatMonth(new Date(y, m - 1 + delta, 1))
    return load.reload(fetchItems)
  }

  async function fetchItems() {
    // TODO: focusedMonth 기준으로 일정 조회
  }

  return {
    isLoading: load.isLoading,
    error: load.error,
    items,
    focusedMonth,
    selectedDate,
    itemsOfSelectedDate,
    load: load0,
    selectDate,
    moveMonth,
  }
})

function todayMonth() {
  return formatMonth(new Date())
}

function formatMonth(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
