// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false

    // ⚠️ 절대 apply 하지 말 것 — classpath 에만 올리는 용도다.
    //
    // AGP 9 는 Kotlin 을 내장(built-in Kotlin)하며 그 컴파일러 버전으로
    // buildscript classpath 의 KotlinBaseApiPlugin 버전을 그대로 쓴다.
    // AGP 9.x 가 선언한 기본값은 2.2.10 인데, 여기서 KGP 를 선언해 두면
    // 2.2.10 -> 2.4.21 로 덮어써진다. (./gradlew buildEnvironment 로 확인 가능)
    // 이게 없으면 Kotlin 2.4 메타데이터로 빌드된 의존성(kotlinx-serialization 1.12.0 등)을
    // "compiled with an incompatible version of Kotlin" 으로 읽지 못한다.
    //
    // 반대로 :app 에서 이걸 apply 하면 AGP 9 의 new DSL 과 충돌해
    // "ApplicationExtensionImpl cannot be cast to BaseExtension" 로 빌드가 깨진다.
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.kotlin.serialization) apply false
    alias(libs.plugins.ksp) apply false
    alias(libs.plugins.hilt) apply false
}
