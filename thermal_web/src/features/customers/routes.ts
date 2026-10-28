import type { FeatureRoute } from '@/shared/types/route'

export const customersRoutes: FeatureRoute[] = [
  {
    path: 'customers',
    name: 'customers',
    component: () => import('./CustomerListView.vue'),
    meta: {
      title: '담당 수용가',
      keepAlive: true,
      componentName: 'CustomerListView',
      nav: { label: '담당 수용가', icon: 'users', order: 30 },
    },
  },
  {
    // 상세는 탭이 아니므로 nav 없음, KeepAlive도 하지 않는다 (id마다 다른 화면)
    path: 'customers/:id',
    name: 'customer-detail',
    component: () => import('./CustomerDetailView.vue'),
    props: true,
    meta: { title: '수용가 상세' },
  },
]
