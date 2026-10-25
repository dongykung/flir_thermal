# FLIR Atlas Java SDK (Android)

이 디렉터리의 `.aar` 파일은 크기 때문에 **깃에 포함되지 않습니다**
(`thermalsdk-release.aar`가 106MB로 GitHub의 파일당 100MB 제한 초과).
클론 후 아래 절차로 직접 배치해야 빌드됩니다.

## 필요한 파일

| 파일 | 크기 | 역할 |
|---|---|---|
| `thermalsdk-release.aar` | 106 MB | 코어. `com.flir.thermalsdk.*` + 네이티브 `.so` |
| `androidsdk-release.aar` | 0.5 MB | Android 진입점. `ThermalSdkAndroid.init()`, USB/mDNS 연결 |

버전: **2.22.0** (`atlas-java-sdk-android-2.22.0.tar.gz`)

## 받는 곳

[FLIR Developer Portal](https://developer.flir.com/) 로그인 → Atlas SDK →
Java SDK for Android → `atlas-java-sdk-android-<version>.tar.gz` 다운로드.
(계정/라이선스 필요 — 재배포 불가)

## 배치

```bash
tar -xzf atlas-java-sdk-android-2.22.0.tar.gz
cp atlas-java-sdk-android-2.22.0/*.aar app/libs/
```

압축을 풀면 `javadoc/` 디렉터리도 함께 나옵니다. API 레퍼런스가 필요하면
`javadoc/index.html`을 브라우저로 열어 보세요.

## 빌드 제약

- `minSdk` **33 이상** — AAR manifest가 `minSdkVersion="33"`
- `compileSdk` **36 이상** — AAR metadata가 `minCompileSdk=36`
- 제공 ABI는 `arm64-v8a`, `armeabi-v7a`, `x86_64` (**`x86` 없음**)
- 실제 카메라 연결 테스트는 실기기 필요 (에뮬레이터는 USB 패스스루 불가)
