/**
 * 같은 번들을 Android WebView와 일반 브라우저 양쪽에서 쓰기 때문에,
 * 실행 환경을 구분해야 하는 지점이 생긴다. (네이티브 브릿지 호출, 뒤로가기 처리 등)
 */

/** Android 측에서 addJavascriptInterface(obj, "ThermalBridge") 로 주입하는 객체 */
export interface ThermalBridge {
  [method: string]: (...args: never[]) => unknown
}

declare global {
  interface Window {
    ThermalBridge?: ThermalBridge
  }
}

/** Android WebView 안에서 실행 중인지 */
export function isNativeWebView(): boolean {
  return typeof window !== 'undefined' && typeof window.ThermalBridge !== 'undefined'
}

/** 브릿지가 있으면 반환, 없으면 null (웹 실행 시) */
export function bridge(): ThermalBridge | null {
  return window.ThermalBridge ?? null
}
