import type { RouteRecordRaw } from 'vue-router'

/**
 * 각 feature가 자기 라우트를 직접 선언하고, router/ 가 그걸 모으기만 한다.
 * 라우트에 붙는 메타는 전부 여기서 타입을 고정한다.
 */
declare module 'vue-router' {
  interface RouteMeta {
    /** 헤더에 표시할 화면 제목 */
    title?: string

    /**
     * 탭 전환 시 상태를 유지할지 여부.
     * true면 KeepAlive 캐시 대상이 되고, componentName이 반드시 있어야 한다.
     */
    keepAlive?: boolean

    /**
     * KeepAlive의 include는 '컴포넌트 이름'으로 매칭한다.
     * 라우트 컴포넌트는 지연 로딩이라 이름을 추론할 수 없으므로,
     * View 쪽 defineOptions({ name }) 과 같은 값을 여기에 명시한다.
     */
    componentName?: string

    /**
     * true면 사이드바/헤더(앱 셸) 없이 전체화면으로 뜬다.
     * router가 AppLayout의 자식이 아니라 형제로 등록하기 때문에
     * path를 '/' 로 시작하는 절대 경로로 써야 한다.
     */
    fullscreen?: boolean

    /** 사이드바에 노출할 탭이면 지정 */
    nav?: NavMeta
  }
}

export interface NavMeta {
  label: string
  icon: IconName
  /** 작을수록 위. 미지정 시 선언 순서 */
  order?: number
  /** 뱃지 숫자를 읽어올 키 (useAppShellStore의 badges에서 조회) */
  badgeKey?: BadgeKey
}

export type IconName =
  | 'home'
  | 'calendar'
  | 'users'
  | 'file'
  | 'settings'
  | 'bell'
  | 'bolt'

export type BadgeKey = 'reports'

/** feature의 routes.ts 가 export 하는 타입 */
export type FeatureRoute = RouteRecordRaw
