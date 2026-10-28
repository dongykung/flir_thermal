import type { FeatureRoute } from '@/shared/types/route'

export const settingsRoutes: FeatureRoute[] = [
  {
    path: 'settings',
    name: 'settings',
    component: () => import('./SettingsView.vue'),
    meta: {
      title: '설정',
      keepAlive: true,
      componentName: 'SettingsView',
      nav: { label: '설정', icon: 'settings', order: 50 },
    },
  },
]
