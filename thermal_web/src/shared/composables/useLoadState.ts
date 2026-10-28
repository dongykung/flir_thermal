import { ref, type Ref } from 'vue'

export interface LoadState {
  isLoading: Ref<boolean>
  error: Ref<string | null>
  /** 최초 1회만 로드. 탭이 KeepAlive로 살아있는 동안 재진입해도 다시 안 부른다 */
  loadOnce: (task: () => Promise<void>) => Promise<void>
  /** 사용자가 명시적으로 새로고침 */
  reload: (task: () => Promise<void>) => Promise<void>
}

/**
 * 거의 모든 store가 쓰는 loading/error/최초로드 처리.
 * store setup 안에서 호출해 그 상태를 그대로 노출한다.
 */
export function useLoadState(): LoadState {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isLoaded = ref(false)

  async function run(task: () => Promise<void>) {
    isLoading.value = true
    error.value = null
    try {
      await task()
    } catch (e) {
      // 실패를 삼키지 않고 error 상태로 옮긴다
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      isLoading.value = false
      isLoaded.value = true
    }
  }

  return {
    isLoading,
    error,
    loadOnce: async (task) => {
      if (isLoaded.value || isLoading.value) return
      await run(task)
    },
    reload: run,
  }
}
