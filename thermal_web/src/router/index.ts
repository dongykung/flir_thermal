import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { homeRoutes } from '@/features/home/routes'
import { scheduleRoutes } from '@/features/schedule/routes'
import { customersRoutes } from '@/features/customers/routes'
import { reportsRoutes } from '@/features/reports/routes'
import { settingsRoutes } from '@/features/settings/routes'
import { inspectionRoutes } from '@/features/inspection/routes'
import type { BadgeKey, IconName } from '@/shared/types/route'

/**
 * feature가 선언한 라우트를 여기서 모으기만 한다.
 * 새 feature를 추가할 때 손댈 곳은 이 배열 하나.
 */
const featureRoutes: RouteRecordRaw[] = [
  ...homeRoutes,
  ...scheduleRoutes,
  ...customersRoutes,
  ...reportsRoutes,
  ...settingsRoutes,
  ...inspectionRoutes,
]

/** 사이드바/헤더 안에서 뜨는 화면 */
const shellRoutes = featureRoutes.filter((r) => !r.meta?.fullscreen)

/** 앱 셸 없이 전체화면으로 뜨는 화면 (점검 수행 등) */
const fullscreenRoutes = featureRoutes.filter((r) => r.meta?.fullscreen)

for (const r of fullscreenRoutes) {
  // 최상위로 등록되므로 상대 경로면 매칭이 어긋난다
  if (!r.path.startsWith('/')) {
    throw new Error(`fullscreen 라우트의 path는 '/'로 시작해야 합니다: ${String(r.name)}`)
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/app/AppLayout.vue'),
    redirect: { name: 'home' },
    children: shellRoutes,
  },
  ...fullscreenRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/app/NotFoundView.vue'),
  },
]

/**
 * WebView에서는 file:// 또는 asset 경로로 로드되므로 history 모드를 쓰면
 * 새로고침/딥링크에서 404가 난다. 해시 모드가 웹/WebView 양쪽에서 안전하다.
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const title = to.meta.title
  document.title = title ? `${title} · 전기안전관리` : '전기안전관리'
})

export default router

export interface NavItem {
  routeName: string
  label: string
  icon: IconName
  badgeKey?: BadgeKey
}

/** 사이드바 탭 목록. meta.nav 를 선언한 라우트에서 자동 수집한다 */
export const navItems: NavItem[] = featureRoutes
  .filter((r) => r.meta?.nav)
  .sort((a, b) => (a.meta!.nav!.order ?? 0) - (b.meta!.nav!.order ?? 0))
  .map((r) => ({
    routeName: String(r.name),
    label: r.meta!.nav!.label,
    icon: r.meta!.nav!.icon,
    badgeKey: r.meta!.nav!.badgeKey,
  }))

/**
 * KeepAlive의 include 목록.
 * 라우트 컴포넌트가 지연 로딩이라 이름 추론이 안 되므로,
 * 각 View의 defineOptions({ name }) 값을 meta.componentName 으로 받아 쓴다.
 */
export const keepAliveComponents: string[] = featureRoutes
  .filter((r) => r.meta?.keepAlive)
  .map((r) => {
    const name = r.meta?.componentName
    if (!name) {
      throw new Error(`keepAlive 라우트에 componentName이 없습니다: ${String(r.name)}`)
    }
    return name
  })
