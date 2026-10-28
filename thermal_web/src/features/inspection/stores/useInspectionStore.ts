import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useLoadState } from '@/shared/composables/useLoadState'
import type { Inspection } from '@/shared/types/domain'

/**
 * 점검 수행 화면의 상태.
 *
 * 이 화면은 KeepAlive 대상이 아니지만 store는 싱글톤이라, 다른 점검으로 들어오면
 * 이전 점검 데이터가 남는다. open()에서 id가 바뀌면 반드시 초기화한다.
 */
export const useInspectionStore = defineStore('inspection', () => {
  const load = useLoadState()

  // ── state ────────────────────────────────────────
  const inspectionId = ref<string | null>(null)
  const inspection = ref<Inspection | null>(null)

  // ── action ───────────────────────────────────────
  /** View가 라우트 param으로 받은 id를 넘긴다 */
  function open(id: string) {
    if (inspectionId.value === id) return
    reset()
    inspectionId.value = id
    // TODO: id로 점검 상세 조회 → inspection 채우기
    return load.reload(async () => {})
  }

  function reset() {
    inspectionId.value = null
    inspection.value = null
  }

  return {
    isLoading: load.isLoading,
    error: load.error,
    inspectionId,
    inspection,
    open,
    reset,
  }
})
