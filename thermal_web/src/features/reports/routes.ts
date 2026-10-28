import type { FeatureRoute } from '@/shared/types/route'

export const reportsRoutes: FeatureRoute[] = [
  {
    path: 'reports',
    name: 'reports',
    component: () => import('./ReportListView.vue'),
    meta: {
      title: '보고서',
      keepAlive: true,
      componentName: 'ReportListView',
      nav: { label: '보고서', icon: 'file', order: 40, badgeKey: 'reports' },
    },
  },
]
