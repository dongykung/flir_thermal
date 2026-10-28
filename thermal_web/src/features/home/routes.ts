import type { FeatureRoute } from '@/shared/types/route'

/** 홈 feature가 자기 경로를 직접 선언한다. router/ 는 이걸 모으기만 한다. */
export const homeRoutes: FeatureRoute[] = [
  {
    path: 'home',
    name: 'home',
    component: () => import('./HomeView.vue'),
    meta: {
      title: '홈',
      keepAlive: true,
      componentName: 'HomeView',
      nav: { label: '홈', icon: 'home', order: 10 },
    },
  },
]
