import type { FeatureRoute } from '@/shared/types/route'

export const scheduleRoutes: FeatureRoute[] = [
  {
    path: 'schedule',
    name: 'schedule',
    component: () => import('./ScheduleView.vue'),
    meta: {
      title: '내 일정',
      keepAlive: true,
      componentName: 'ScheduleView',
      nav: { label: '내 일정', icon: 'calendar', order: 20 },
    },
  },
]
