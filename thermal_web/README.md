# thermal_web

FLIR 열화상 앱의 웹 화면. Vue 3 + TypeScript + Vite.

같은 번들을 **Android WebView 전체화면**과 **일반 웹 브라우저** 양쪽에서 띄우는 것을 전제로 설정돼 있다.

## 실행

```bash
npm install
npm run dev      # http://localhost:5173 (LAN 바인딩 — 실기기에서 PC IP로 접속 가능)
npm run build    # 타입체크 + dist/ 생성
npm run preview  # 빌드 결과 확인
```

## 구조

feature 단위로 자르고, 각 feature가 **자기 라우트를 직접 선언**한다. `router/` 는 그걸 모으기만 한다.

```
src/
├─ main.ts                  # pinia + router 등록
├─ App.vue                  # RouterView 한 줄
├─ style.css                # 디자인 토큰 + 모바일 리셋 + .screen / .scroll-y / .card
│
├─ app/                     # 앱 셸 (feature에 속하지 않는 공통 틀)
│  ├─ AppLayout.vue         # 사이드바 + 헤더 + KeepAlive RouterView
│  ├─ NotFoundView.vue
│  ├─ components/           # AppSidebar, AppHeader
│  └─ stores/useAppShellStore.ts
│
├─ features/                # 탭 하나 = feature 하나 (+ 탭이 아닌 inspection)
│  └─ <feature>/
│     ├─ routes.ts          # 이 feature의 경로 선언
│     ├─ XxxView.vue        # 화면 (로직 없음, store 바인딩만)
│     ├─ stores/useXxxStore.ts
│     └─ components/        # 이 feature 전용 컴포넌트
│
├─ router/index.ts          # feature routes 수집 + navItems/keepAlive 목록 파생
└─ shared/
   ├─ types/            # route.ts(RouteMeta 확장), domain.ts(공유 도메인 타입)
   ├─ composables/      # useLoadState
   ├─ lib/platform.ts   # WebView 판별 + 네이티브 브릿지
   └─ ui/               # 공용 컴포넌트 (AppIcon)
```

`@` → `src` 로 import 한다 (`import { useHomeStore } from '@/features/home/stores/useHomeStore'`).

### feature 추가하는 법

1. `features/<name>/` 에 `routes.ts` + `XxxView.vue` + `stores/useXxxStore.ts`
2. View에 `defineOptions({ name: 'XxxView' })` — routes의 `meta.componentName` 과 같은 값
3. `router/index.ts` 의 `featureRoutes` 배열에 추가 — **여기가 유일하게 손대는 공용 파일**

사이드바 탭 목록과 KeepAlive 대상은 라우트 메타에서 자동으로 파생되므로 따로 등록하지 않는다.

### 전체화면 화면 (사이드바 없음)

점검 수행처럼 현장에서 몰입해서 쓰는 화면은 사이드바/헤더를 띄우지 않는다. 라우트에 `meta.fullscreen: true` 를 주면 router가 `AppLayout` 의 **자식이 아니라 형제**로 등록한다.

```ts
// features/inspection/routes.ts
{
  path: '/inspection/:id',   // 최상위에 붙으므로 절대 경로여야 한다
  name: 'inspection',
  props: true,
  meta: { title: '점검', fullscreen: true, keepAlive: false },
}
```

상대 경로를 쓰면 매칭이 조용히 어긋나므로 `router/index.ts` 에서 `/` 로 시작하지 않으면 에러를 던진다.

진입은 홈의 '진행 중 점검' 카드에서 id를 넘기는 식이다.

```ts
router.push({ name: 'inspection', params: { id } })
```

`useInspectionStore` 는 싱글톤이고 이 화면은 KeepAlive 대상이 아니라서, 다른 점검으로 들어오면 이전 데이터가 남는다. `open(id)` 에서 id가 바뀌면 `reset()` 후 다시 로드한다.

### 레이어 이름

Android의 ViewModel에 해당하는 층은 **Pinia store**다. 상태가 뷰보다 오래 살아야 하고(탭 KeepAlive) 싱글톤이어야 해서, 컴포넌트와 생명주기를 같이하는 composable이 아니라 store가 맞다.

| 역할 | 이름 | 위치 |
| --- | --- | --- |
| 라우트 단위 화면 | `XxxView.vue` | `features/<name>/` |
| 화면 상태 + 비즈니스 로직 | `useXxxStore` | `features/<name>/stores/` |
| 재사용 로직 조각 (컴포넌트 종속) | `useXxx` composable | `shared/composables/` 또는 feature 내부 |

### store 규약

**View는 상태를 들고 있지 않는다.**

```ts
export const useXxxStore = defineStore('xxx', () => {
  const state = ref(...)                       // state
  const derived = computed(() => ...)          // derived — View에서 계산 금지
  function doSomething() { ... }               // action — View는 이것만 호출
  return { state, derived, doSomething }
})
```

- View는 `store.state = ...` 로 직접 쓰지 않는다. 반드시 action 경유.
- 로딩/에러/최초 1회 로드는 `useLoadState()` composable을 쓴다.
- feature 간에 공유하는 도메인 타입은 `shared/types/domain.ts` 에 둔다 (feature끼리 직접 import 하면 역참조가 생긴다).

### 탭 상태 유지 (KeepAlive)

`meta.keepAlive: true` 인 라우트는 탭을 떠나도 컴포넌트가 캐시된다 (스크롤 위치·검색어·폼 입력 유지).

라우트 컴포넌트가 지연 로딩이라 KeepAlive의 `include`가 이름을 추론하지 못한다. 그래서 `meta.componentName` 과 View의 `defineOptions({ name })` 을 같은 값으로 맞춰야 한다. 불일치하면 캐시가 조용히 안 먹으므로, `router/index.ts` 에서 `componentName` 누락 시 에러를 던진다.

데이터 재조회는 `onMounted` + `onActivated` 양쪽에 `store.load()` 를 걸어두고, `loadOnce` 가 중복 호출을 무시하는 식으로 처리한다. 매번 새로 받아야 하는 화면은 `onActivated`에서 `store.refresh()` 를 부르면 된다.

상세 화면처럼 파라미터마다 내용이 달라지는 경우는 `keepAlive`를 주지 않는다 (`customers/:id` 참고).

### 색상

`style.css` 의 토큰만 쓴다. 원시 색상(`--blue-600` 등)은 토큰 정의부에서만 참조하고, 컴포넌트에서는 의미 토큰(`--brand`, `--text-strong`, `--status-done-bg` …)을 쓴다. 시안이 라이트 기준이라 `color-scheme: light` 로 고정해 뒀고, 다크 시안이 나오면 `[data-theme='dark']` 블록에서 토큰만 덮어쓰면 된다.

## 웹앱 설정 요약

왜 이렇게 되어 있는지 — 건드리기 전에 참고.

| 설정 | 위치 | 이유 |
| --- | --- | --- |
| `base: './'` | vite.config.ts | Android `assets/`·`file://` 로 로드해도 번들 경로가 안 깨지게 |
| 해시 라우터 | router/index.ts | WebView에서 history 모드는 새로고침·딥링크 시 404 |
| `viewport-fit=cover` + `env(safe-area-inset-*)` | index.html, style.css | 노치/홈 인디케이터 겹침 방지 |
| `user-scalable=no` | index.html | 전체화면 앱에서 핀치 줌 차단 |
| `overscroll-behavior: none` | style.css | 당겨서 새로고침 / 바운스 스크롤 차단 |
| `height: 100dvh` | style.css | 모바일 주소창 접힘에 따라 높이 정확히 추종 |
| `user-select: none`, `tap-highlight: transparent` | style.css | 길게 눌러 선택·탭 깜빡임 같은 웹 티 제거 |
| `sourcemap: true` | vite.config.ts | WebView 원격 디버깅용 |

레이아웃은 `.screen`(safe-area 적용된 전체화면 컨테이너) 안에 `.scroll-y`(스크롤 영역)를 두는 패턴을 쓴다. `body`는 `overflow: hidden`이라 전역 스크롤이 없다.

## Android WebView 연동

`shared/lib/platform.ts` 가 `window.ThermalBridge` 존재 여부로 실행 환경을 판별한다. 네이티브 쪽에서 맞춰야 하는 것:

```kotlin
webView.settings.apply {
    javaScriptEnabled = true
    domStorageEnabled = true
}
WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)
webView.addJavascriptInterface(ThermalBridge(), "ThermalBridge")
```

로딩 방식 두 가지:

- **번들 내장**: `npm run build` → `dist/` 를 `app/src/main/assets/web/` 로 복사 → `file:///android_asset/web/index.html`
- **개발 중**: `npm run dev` 후 `http://<PC IP>:5173` 를 직접 로드 (HMR 그대로 동작)
