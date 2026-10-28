import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useLoadState } from '@/shared/composables/useLoadState'
import type { InspectionCycle } from '@/shared/types/domain'

export interface Customer {
  id: string
  name: string
  region: string
  cycle: InspectionCycle
}

export const useCustomerListStore = defineStore('customer-list', () => {
  const load = useLoadState()

  // ── state ────────────────────────────────────────
  const customers = ref<Customer[]>([])
  const keyword = ref('')
  /** KeepAlive 덕분에 탭을 떠났다 돌아와도 스크롤 위치/검색어가 유지된다 */
  const scrollTop = ref(0)

  // ── derived ──────────────────────────────────────
  const filtered = computed(() => {
    const k = keyword.value.trim()
    if (!k) return customers.value
    return customers.value.filter((c) => c.name.includes(k) || c.region.includes(k))
  })

  // ── action ───────────────────────────────────────
  function load0() {
    return load.loadOnce(fetchCustomers)
  }

  function search(value: string) {
    keyword.value = value
  }

  function rememberScroll(top: number) {
    scrollTop.value = top
  }

  async function fetchCustomers() {
    // TODO: API 연동
  }

  return {
    isLoading: load.isLoading,
    error: load.error,
    customers,
    keyword,
    scrollTop,
    filtered,
    load: load0,
    search,
    rememberScroll,
  }
})
