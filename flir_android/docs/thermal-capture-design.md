# 열화상 촬영 · 포인트 측정 설계서

목표 흐름:

```
라이브 화면 (스트리밍)  ──[찍기]──▶  정지 이미지 화면 (포인트 측정)
        ▲                                      │
        └──────────── [다시찍기] ───────────────┘
```

전제: Stage 0~2 완료 (SDK 초기화 · 스캔 · USB 권한). 이 문서는 Stage 3~6을 다룬다.

---

## 1. 화면 구성 — 라우트 두 개

| 라우트 | 책임 |
|---|---|
`Route.Camera` | 연결 · 스트리밍 · 촬영 |
`Route.Review(path)` | 저장된 파일 열기 · 포인트 측정 |

```kotlin
sealed interface Route : NavKey {
    @Serializable data object Home : Route
    @Serializable data object Camera : Route
    @Serializable data class Review(val path: String) : Route
}
```

**라우트를 두 개로 나누는 이유**

- `다시찍기` = `backStack.removeLastOrNull()` 한 줄. **하드웨어 뒤로가기도 자동으로 같은 동작**이 된다
- `Review`로 넘어가도 `Camera` 엔트리가 백스택에 남으므로 **ViewModel이 살아 있고 카메라 연결이 유지된다** → 복귀가 즉시
- 라이브(`ThermalStreamer`)와 정지(`ImageColorizer`)는 **쓰는 API가 아예 다르다**. 한 ViewModel에 섞으면 상태 머신이 엉킨다
- 파일 경로는 `String`이라 `@Serializable` 제약을 통과한다 (`Identity`는 못 넘기지만 경로는 넘길 수 있다)

> 대안: 한 화면에서 `mode: Live | Review` 상태로 전환. 뒤로가기를 직접 가로채야 하고 ViewModel이 두 배로 복잡해진다. 권장하지 않음.

`Route.Camera`는 **인자를 받지 않는다.** `Identity`는 직렬화할 수 없고, `deviceId`는 javadoc이 세션 한정 값이라고 명시했으므로 넘겨도 쓸 수 없다. 스캔은 Camera 화면 안에서 한다.

---

## 2. core 레이어에 추가할 것

기존 `core/thermal/`에 두 개를 더한다.

```
core/thermal/
  ThermalCameraDiscovery.kt      ✅ 완료 (@Singleton)
  UsbAccess.kt                   ✅ 완료 (@Singleton)
  ThermalCameraInfo.kt           ✅ 완료
  ThermalCameraSession.kt        ← 신규. 연결 + 스트림 + 촬영
  ThermalSnapshot.kt             ← 신규. 저장된 파일 열기 + 포인트
```

### 2.1 `ThermalCameraSession` — 싱글턴이 **아니다**

`Camera` · `Stream` · `ThermalStreamer`는 **연결 단위 수명**이다. 연결할 때 생기고 끊을 때 죽는다. 싱글턴으로 만들면 끊긴 세션이 앱 수명만큼 남는다.

Hilt 구성: 세션을 만드는 **커넥터만 싱글턴**으로 두고, 세션 인스턴스는 ViewModel이 소유한다.

```kotlin
@Singleton
class ThermalCameraConnector @Inject constructor() {
    suspend fun connect(identity: Identity): ThermalCameraSession   // Dispatchers.IO
}

class ThermalCameraSession internal constructor(/* camera, stream, streamer */) {
    val frames: Flow<ImageBuffer>                 // CONFLATED
    val disconnects: Flow<String>                 // onDisconnected(ErrorCode)
    suspend fun cameraInfo(): String?             // Stage 3 검증용
    suspend fun startStream()
    suspend fun stopStream()
    suspend fun capture(absolutePath: String)     // saveAs
    suspend fun close()
}
```

세션이 품는 책임:

| 메서드 | 내부 호출 | 스레드 |
|---|---|---|
`connect` | `Camera().connect(identity, listener, ConnectParameters())` | **IO (blocking)** |
`startStream` | `camera.streams[0]` → `ThermalStreamer(stream)` → `stream.start(..)` | IO |
`frames` | `onReceived` → `update()` → `getImage()` | **전용 단일 스레드** |
`capture` | `withThermalImage { it.saveAs(path) }` | **전용 단일 스레드** |
`close` | `stop()` → `streamer.close()` → `disconnect()` → `camera.close()` | IO |

### 2.2 `ThermalSnapshot` — 저장된 파일 한 장

```kotlin
class ThermalSnapshot private constructor(/* file, colorizer */) {
    companion object { suspend fun open(path: String): ThermalSnapshot }

    val irWidth: Int
    val irHeight: Int

    suspend fun render(): ImageBuffer                  // colorizer.update() + getImage()
    suspend fun addSpot(x: Int, y: Int): SpotReading
    suspend fun spots(): List<SpotReading>
    suspend fun clearSpots()
    suspend fun close()
}

data class SpotReading(val x: Int, val y: Int, val celsius: Double?, val state: String)
```

`open()` 내부:

```kotlin
val file = ImageFactory.createImage(path) as ThermalImageFile   // throws IOException
file.setTemperatureUnit(TemperatureUnit.CELSIUS)
val colorizer = ImageColorizer(file).apply {
    isRenderScale = true
    isAutoScale = true        // 저장 시 스케일과 무관하게 잘 보이도록
}
```

`isAutoScale = true`는 ACE 가이드의 "Opening a taken picture" 절에서 권장하는 설정이다.

---

## 3. 스레딩 계약

이 설계의 핵심이다. javadoc 근거와 함께.

```
┌─ 스트리밍 스레드 (SDK 소유) ──────────────────────────┐
│  Stream.start 의 onReceived                          │
│  → Channel(CONFLATED).trySend(Unit)   알림만!         │
└──────────────────────────────────────────────────────┘
                        ↓
┌─ 전용 단일 스레드 (우리 소유) ─────────────────────────┐
│  streamer.update()                                   │
│  streamer.getImage()                                 │
│  streamer.withThermalImage { ... }   ← saveAs 도 여기  │
└──────────────────────────────────────────────────────┘
                        ↓
┌─ 메인 스레드 ────────────────────────────────────────┐
│  BitmapAndroid.createBitmap(buffer).bitMap           │
│  StateFlow<ImageBitmap> → Compose Image              │
└──────────────────────────────────────────────────────┘
```

| 규칙 | 근거 |
|---|---|
`onReceived`에서 연산 금지 | *"should only be used to trigger/notify a render thread... may result in reduced performance or lost frames"* |
`update()`를 스트림 스레드에서 호출 금지 | javadoc 샘플 주석: *"don't call thermalStreamer.update() directly on the stream thread"* |
`Streamer` 호출을 한 스레드에 고정 | `Streamer`는 thread-safe 보장이 없다 |
`connect`/`disconnect`는 백그라운드 | `@BackgroundThread` + *"this method is blocking"* |
`Camera` 객체 동시 접근 금지 | *"This class is not guaranteed to be thread-safe"* |

구현:

```kotlin
@OptIn(ExperimentalCoroutinesApi::class)
private val renderThread = Dispatchers.Default.limitedParallelism(1)
```

`ImageColorizer`도 같다 — `ThermalSnapshot`의 모든 메서드를 단일 스레드에 고정한다.

### CONFLATED 를 쓰는 이유

렌더가 카메라를 못 따라갈 때 **낡은 프레임을 버리고 최신 것만** 처리해야 한다. `Channel.CONFLATED`가 이걸 공짜로 해준다. 디스커버리 이벤트(기본 버퍼)와 다른 선택이다 — 이벤트는 버리면 안 되지만 프레임은 버려야 한다.

---

## 4. 상태 머신

### 라이브 (`CameraViewModel`)

```
Scanning ──▶ NeedsPermission ──▶ Connecting ──▶ Streaming ──▶ Capturing
   │               │                  │             │             │
   └───────────────┴──────────────────┴─────────────┴─────────────┴──▶ Error
```

```kotlin
sealed interface LiveState {
    data object Scanning : LiveState
    data class Found(val cameras: List<ThermalCameraInfo>) : LiveState
    data class NeedsPermission(val camera: ThermalCameraInfo) : LiveState
    data class Connecting(val camera: ThermalCameraInfo) : LiveState
    data class Streaming(val frame: ImageBitmap?, val modelName: String?) : LiveState
    data object Capturing : LiveState
    data class Error(val message: String, val retryable: Boolean) : LiveState
}
```

### 정지 (`ReviewViewModel`)

```kotlin
sealed interface ReviewState {
    data object Loading : ReviewState
    data class Ready(
        val image: ImageBitmap,
        val irWidth: Int,
        val irHeight: Int,
        val spots: List<SpotReading>,
    ) : ReviewState
    data class Error(val message: String) : ReviewState
}
```

---

## 5. 촬영 흐름 — 비동기라는 점이 중요

`찍기` 버튼을 눌러도 **그 자리에서 저장되지 않는다.** `saveAs`는 `withThermalImage { }` 안에서만 호출할 수 있고, 그 블록은 다음 렌더 틱에 실행된다.

```
[찍기] 클릭
  → state = Capturing (버튼 비활성화)
  → 파일 경로 생성
  → 전용 스레드에서 withThermalImage { setTemperatureUnit; saveAs(path) }
  → 성공 → 일회성 이벤트 Captured(path) 발행
  → 화면이 받아서 backStack.add(Route.Review(path))
```

**네비게이션은 상태가 아니라 일회성 이벤트로 보낸다.** 상태로 두면 리컴포지션마다 다시 이동한다.

```kotlin
private val _events = Channel<CameraEvent>(Channel.BUFFERED)
val events = _events.receiveAsFlow()

sealed interface CameraEvent {
    data class Captured(val path: String) : CameraEvent
}
```

화면 쪽:

```kotlin
LaunchedEffect(Unit) {
    viewModel.events.collect { event ->
        when (event) {
            is CameraEvent.Captured -> onCaptured(event.path)
        }
    }
}
```

### 저장 경로

권한이 필요 없는 앱 전용 디렉터리를 쓴다.

```kotlin
val dir = context.getExternalFilesDir(Environment.DIRECTORY_PICTURES)
// SDK 헬퍼로 충돌 없는 이름 생성
val path = FileUtils.prepareUniqueFileName(dir.absolutePath, "thermal", "jpg")
```

> 갤러리에 노출하려면 나중에 `AndroidFilesUtil.scanMedia(ctx, path)`를 쓴다. 지금 범위 밖.

---

## 6. 스트림 일시정지 — Review 로 넘어갈 때

`Review`로 이동하면 라이브 화면은 컴포지션에서 빠지지만 **ViewModel은 백스택에 살아 있다.** 스트림을 그대로 두면 배터리와 CPU를 낭비한다.

연결은 유지하고 **스트림만** 멈춘다. 복귀가 빨라진다.

```kotlin
// CameraScreen
LaunchedEffect(Unit) { viewModel.resumeStream() }
DisposableEffect(Unit) {
    onDispose { viewModel.pauseStream() }   // Review 로 push 될 때 실행됨
}
```

`DisposableEffect`를 쓰는 이유: Nav3 엔트리별 `Lifecycle`에 의존하지 않아도 동작한다. 컴포지션 진입/이탈만 보면 된다.

`pauseStream` = `stream.stop()` / `resumeStream` = `stream.start(..)`. 연결(`camera`)은 건드리지 않는다.

---

## 7. 좌표 변환 — 실제 작업량의 절반

해상도가 세 가지로 다르다.

```
IR 센서 해상도        ← addSpot / getValueAt 의 좌표계
비주얼 카메라 해상도   ← 퓨전용 사진
Compose 화면 해상도   ← 탭 좌표
```

화면 탭 좌표를 그대로 `addSpot`에 넣으면 엉뚱한 위치가 측정된다.

### 레터박스를 없애서 변환을 단순화한다

`ContentScale.Fit`을 쓰면 여백이 생기고 변환식에 오프셋이 끼어든다. **`aspectRatio`로 이미지 박스를 IR 비율에 정확히 맞추면** 정규화가 단순해진다.

```kotlin
Image(
    bitmap = state.image,
    contentDescription = null,
    contentScale = ContentScale.FillBounds,
    modifier = Modifier
        .fillMaxWidth()
        .aspectRatio(state.irWidth.toFloat() / state.irHeight)
        .pointerInput(state.irWidth, state.irHeight) {
            detectTapGestures { offset ->
                val x = (offset.x / size.width * state.irWidth).toInt()
                val y = (offset.y / size.height * state.irHeight).toInt()
                viewModel.onTap(x, y)
            }
        },
)
```

`size`는 `PointerInputScope`가 주는 실제 레이아웃 크기다. 좌표계가 하나뿐이므로 비율 한 번으로 끝난다.

### 경계값 처리

`addSpot`은 범위를 벗어나면 `IllegalArgumentException`을 던진다. `coerceIn(0, irWidth - 1)`로 묶는다.

### 단일 픽셀 읽기를 쓰지 않는다

javadoc이 `getValueAt`에 경고를 달아놨다 — Lepton 코어에서는 한 픽셀 값이 부정확하므로 `MeasurementSpot`을 쓰라고. `MeasurementSpot`은 3×3/5×5 이웃을 캘리브레이션 데이터로 보정한다.

**따라서 포인트 측정은 `measurements.addSpot(x, y)` + `spot.value`로 한다.**

### 측정값 검증

```kotlin
val v = spot.value                       // ThermalValue
if (v.state == ThermalValueState.OK) v.value else null
```

`state`가 `INVALID` / `OVERFLOW` / `UNDERFLOW`면 `value`는 의미가 없다. `SpotReading.celsius`를 nullable로 둔 이유다.

> 스팟은 `setMinCalc` 등의 마스크가 필요 없다. 그건 사각형 · 라인 · 타원용이다.

---

## 8. 리소스 해제

### 라이브

```
stream.stop() → streamer.close() → camera.disconnect() → camera.close()
```

javadoc 경고: *"make sure you stop any active stream before disconnecting from the camera."*

`CameraViewModel.onCleared()`에서 호출한다. Nav3의 `rememberViewModelStoreNavEntryDecorator` 덕에 **백스택에서 Camera 엔트리가 빠질 때** 자동으로 불린다. 화면 회전으로는 불리지 않는다(연결 유지 — 의도된 동작).

`onCleared()`는 suspend가 아니므로, `close()`를 앱 수명 스코프에서 실행해야 취소되지 않는다. 커넥터(@Singleton)에 정리 전용 스코프를 두거나 `GlobalScope` 대신 Hilt로 주입한 `@ApplicationScope CoroutineScope`를 쓴다.

### 정지

```
colorizer.close() → thermalImageFile.close()
```

**순서가 반대면 안 된다.** `ImageColorizer` javadoc: *"Lifetime of the image is managed by the user; it must not be freed before this ImageColorizer object is freed."*

### ⚠️ close 후 파생 객체 무효화

`ThermalImage.close()` javadoc: *"All references to the ThermalImage fields became invalid and any further access to them generates exception. You must deep-copy any object before closing."*

→ `Palette`, `Scale`, `Fusion`, `MeasurementShape`, `JavaImageBuffer`를 **ViewModel 상태에 들고 있으면 안 된다.** 우리 설계가 `SpotReading`(순수 데이터)으로 복사해 내보내는 이유다. `MeasurementSpot`을 그대로 노출하지 않는다.

---

## 9. 메모리

| 압박 | 대응 |
|---|---|
`getImage()`가 매번 deep copy | `Channel.CONFLATED`로 처리 횟수 자체를 줄임 |
프레임마다 새 Bitmap 할당 | 이전 `Bitmap.recycle()` 또는 교체 시 해제 |
`getPixelBuffer()`가 복사할 수 있음 | javadoc 권장대로 `ImageBuffer.with(Consumer<ByteBuffer>)` 사용 |
스케일 렌더 추가 연산 | 라이브에서는 `setRenderScale(false)` 유지 (기본값) |

정지 이미지는 한 장이라 부담이 없다. `isRenderScale = true`를 켜도 된다.

---

## 10. 구현 순서와 검증 지점

| # | 작업 | 눈으로 확인할 증거 |
|---|---|---|
3 | `ThermalCameraConnector.connect` | `cameraInfo()`가 **실제 모델명**을 반환 |
4 | `startStream` + 프레임 카운터 | 숫자가 초당 수십씩 증가 (화면 표시 없이) |
5 | `frames` → Bitmap → `Image` | 열화상이 보인다 |
6a | `찍기` → `saveAs` → Review 이동 | 파일이 생기고 정지 화면에 같은 그림이 뜬다 |
6b | 탭 → `addSpot` | 온도 숫자가 뜨고 **손바닥을 비추면 올라간다** |
6c | `다시찍기` | 즉시 라이브 복귀 (재연결 없음) |

4번을 따로 두는 이유: 5번에서 화면이 검을 때 "데이터가 안 오는 것"과 "변환이 틀린 것"을 구분하기 위해서다.

---

## 11. 결정이 필요한 것

| 항목 | 선택지 | 기본 제안 |
|---|---|---|
스팟 개수 | 하나만 / 여러 개 | 여러 개 (`addSpot` 누적, `clearSpots`로 초기화) |
팔레트 선택 UI | 지금 / 나중 | 나중 (`PaletteManager.getDefaultPalettes()`로 쉽게 추가 가능) |
퓨전 모드 | MSX 고정 / 선택 | 나중 |
저장 위치 | 앱 전용 / 갤러리 | 앱 전용 (권한 불필요) |
촬영 후 | 자동 이동 / 확인 후 이동 | 자동 이동 |
단위 | 섭씨 고정 / 선택 | 섭씨 고정 |

---

## 부록 — SDK 문서의 오류 (베끼면 컴파일 안 되는 것들)

| 문서에 쓰인 것 | 실제 2.22.0 |
|---|---|
`DiscoveryManager.getInstance()` | 존재하지 않음. `DiscoveryFactory` |
`ConnectionStatusListener.onConnectionStatusChanged(..)` | 없음. `onDisconnected(ErrorCode)` 하나 |
`ImageFactory.create(..)`, `image.getType()` | 없음. `createImage(..)` + 캐스트 |
`camera.subscribeStream(..)`, `withImage(..)` | deprecated. `getStreams()` + `ThermalStreamer` |
`requestFlirOnePermission` | 실제 철자는 `requestFlirOnePermisson` (s 하나) |
`Camera.requestCameraSnapshot(..)` | **ACE 전용.** FLIR ONE 은 `ThermalImage.saveAs()` |

그리고 `Property.setSync()` / `subscribe()`는 **성공 시 `null`**, 실패 시 `ErrorCode`를 반환한다 (반환값 반전).
