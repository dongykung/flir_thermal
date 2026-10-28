import type { FeatureRoute } from '@/shared/types/route'

/**
 * 점검 수행 화면. 현장에서 쓰는 작업 화면이라 사이드바/헤더 없이 전체화면으로 띄운다.
 * fullscreen: true 라서 router가 AppLayout 바깥(형제)으로 등록한다 → path는 절대 경로.
 */
export const inspectionRoutes: FeatureRoute[] = [
  {
    path: '/inspection/:id',
    name: 'inspection',
    component: () => import('./InspectionView.vue'),
    props: true,
    meta: {
      title: '점검',
      fullscreen: true,
      // 매 점검마다 내용이 다르므로 캐시하지 않는다
      keepAlive: false,
    },
  },
]
