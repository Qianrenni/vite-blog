# Kotlin Multiplatform

## 1. 核心概念与生态概览

### 1.1 什么是 KMP？
Kotlin Multiplatform (KMP) 是 JetBrains 推出的一种跨平台技术，其核心理念是 **“共享逻辑，保留原生体验”**（Share Logic, Keep Native UI），但在 2024-2026 年间，随着 **Compose Multiplatform** 的成熟，这一理念已演变为 **“可选共享 UI”**。

*   **架构哲学对比**：
    *   **KMP (传统模式)**: 共享业务逻辑（网络、数据、算法），UI 层分别使用 Android (Jetpack Compose/XML) 和 iOS (SwiftUI/UIKit)。
    *   **KMP + Compose MP**: 共享业务逻辑 **以及** UI 层。Compose MP 允许你用同一套 Kotlin 代码编写 UI，并在 Android、iOS、Desktop 和 Web 上渲染为原生或接近原生的组件。
    *   **Flutter/React Native**: “Share Everything”。它们通过自己的渲染引擎（Skia/Impeller 或 JS Bridge）绘制 UI。
        *   *差异点*: KMP 在 iOS 上最终编译为原生二进制代码（通过 Kotlin/Native），没有 JS Bridge 的性能损耗，且能直接调用原生 API。Flutter 则是自绘引擎，UI 一致性极高但包体积较大，且非原生控件感。

*   **2024-2026 演进历程**:
    *   **2023**: KMP 宣布稳定，Compose Multiplatform 进入 Beta。
    *   **2024**: Compose Multiplatform 达到 **Stable** 状态，iOS 支持完善。Kotlin/Wasm 成为 Web 开发的主流推荐替代 JS。
    *   **2025-2026**: KMP 成为 Android 开发的默认扩展选项。Google 官方大力推崇 "KMP for Business Logic, Compose for UI"。工具链（IntelliJ/Android Studio）对 KMP 的支持达到原生级别，调试体验大幅提升。

### 1.2 适用场景分析

| 维度 | 选择 KMP ✅ | 不选择 KMP ❌ |
| :--- | :--- | :--- |
| **团队背景** | 团队已有 Kotlin/Android 基础，希望扩展至 iOS/Web。 | 团队纯 Swift 或纯 JS 背景，无 Kotlin 经验。 |
| **业务类型** | 企业应用、内容展示、工具类、需要复杂业务逻辑复用的 App。 | 重度游戏（建议 Unity/Unreal）、极度依赖最新原生硬件特性（如 ARKit 最新功能）。 |
| **UI 需求** | 接受轻微的平台差异，或愿意使用 Compose MP 统一 UI。 | 要求 100% 像素级一致且必须使用原生平台特定动画/交互，且不想学习 Compose。 |
| **维护成本** | 希望减少重复代码，长期维护多端版本。 | 极简原型，一次性项目，或者各端逻辑完全独立。 |

### 1.3 核心组件介绍
*   **Kotlin/Native**: 将 Kotlin 代码编译为 LLVM IR，进而生成原生二进制文件（ARM64/x86_64）。用于 iOS, macOS, Linux, Windows。
*   **Kotlin/JVM**: 编译为字节码，运行在 JVM 上。用于 Android 和后端服务。
*   **Kotlin/JS & Wasm**:
    *   *JS*: 传统 Web 支持。
    *   *Wasm (WebAssembly)*: 2026 年的主流 Web 目标，性能接近原生，启动更快，不再受限于 JS 单线程模型的部分限制。
*   **Compose Multiplatform**: 基于 Jetpack Compose 的 UI 框架，实现了“一次编写，多端运行”。它在 iOS 上通过将 Compose 树映射为 UIKit 视图或直接绘制（取决于配置）来实现高性能渲染。

---

## 2. 环境搭建与项目结构

### 2.1 开发环境准备
*   **IDE**: 推荐使用 **Android Studio Hedgehog (2023.1.1)** 或更高版本（2026 年建议使用最新的 Stable 版，如 Ladybug 或 Meerkat）。IntelliJ IDEA Ultimate 也是极佳选择。
*   **Kotlin Plugin**: 确保 IDE 内置的 Kotlin 插件更新至最新稳定版（支持 K2 Compiler）。
*   **iOS 环境**:
    *   macOS 机器必不可少。
    *   安装最新版的 **Xcode** 和 **Command Line Tools**。
    *   配置 `xcode-select --install`。
*   **JDK**: 推荐 **JDK 17** 或 **JDK 21**（LTS 版本）。Gradle 8.x+ 对 JDK 17+ 支持最好。

### 2.2 创建第一个 KMP 项目
不要手动从头配置 Gradle。使用官方推荐的 **Kotlin Multiplatform Wizard** (web 版或 IDE 插件版)。
*   选择平台：Android, iOS, Desktop, Web (Wasm)。
*   选择 UI 方案：Compose Multiplatform (推荐) 或 No UI (仅逻辑共享)。
*   生成后，直接在 Android Studio 中打开。

### 2.3 深入理解项目结构
KMP 项目的核心在于 **Source Sets (源集)** 的层级结构。

```text
MyKMPProject/
├── shared/               # 核心共享模块
│   ├── src/
│   │   ├── commonMain/   # 【核心】所有平台共享的代码 (Kotlin 标准库 + KMP 兼容库)
│   │   ├── androidMain/  # 仅 Android 可见的代码 (可调用 Android SDK)
│   │   ├── iosMain/      # 仅 iOS 可见的代码 (可调用 UIKit/Foundation)
│   │   ├── jvmMain/      # Desktop/JVM 特定代码
│   │   ├── jsMain/       # Web JS 特定代码
│   │   └── wasmJsMain/   # Web Wasm 特定代码
│   │   └── nativeMain/   # 【中间层】所有 Native 平台 (iOS, macOS, Linux, Windows) 共享
│   │       └── appleMain/# 【中间层】仅 Apple 平台 (iOS, macOS) 共享
│   └── build.gradle.kts
├── androidApp/           # Android 入口模块 (依赖 shared)
├── iosApp/               # iOS 入口模块 (Xcode 项目，依赖 shared framework)
├── desktopApp/           # Desktop 入口模块
└── webApp/               # Web 入口模块
```

*   **继承关系**: `iosMain` 继承自 `appleMain`，`appleMain` 继承自 `nativeMain`，`nativeMain` 继承自 `commonMain`。
*   **作用**: 你可以在 `nativeMain` 中编写适用于所有原生平台的代码（如文件路径处理），而在 `iosMain` 中处理 iOS 特有的权限请求。

---

## 3. Kotlin 语言特性在多平台中的表现

### 3.1 跨平台兼容的子集
*   **kotlin-stdlib**: 绝大部分标准库可用。注意：`java.io.File` 等在 `common` 中不可用，需使用 `kotlinx-io` 或 `expect/actual`。
*   **kotlinx.coroutines**: 完全支持。`Dispatchers.Main` 在各平台自动映射到主线程（Android UI Thread, iOS Main Queue）。
*   **kotlinx.serialization**: 官方推荐的 JSON/ProtoBuf 序列化方案，完美支持多平台。

### 3.2 平台特定 API 的处理：Expect/Actual
这是 KMP 解决平台差异的核心机制。

**步骤 1: 在 `commonMain` 声明接口 (`expect`)**
```kotlin
// commonMain/kotlin/com/example/Platform.kt
package com.example

expect class Platform() {
    val name: String
}
```

**步骤 2: 在平台特定源集实现 (`actual`)**
```kotlin
// androidMain/kotlin/com/example/Platform.kt
package com.example

import android.os.Build

actual class Platform actual constructor() {
    actual val name: String = "Android ${Build.VERSION.SDK_INT}"
}
```

```kotlin
// iosMain/kotlin/com/example/Platform.kt
package com.example

import platform.UIKit.UIDevice

actual class Platform actual constructor() {
    actual val name: String = UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion
}
```

*   **最佳实践**: 尽量在 `common` 中定义高层抽象（如 `StorageInterface`），而不是暴露底层细节。避免在 `common` 代码中导入任何 `android.*` 或 `UIKit.*` 包。

---

## 4. 共享业务逻辑层 (Shared Module)

### 4.1 网络请求：Ktor Client
Ktor 是 KMP 事实标准的网络库。

```kotlin
// build.gradle.kts (shared)
implementation("io.ktor:ktor-client-core:$ktorVersion")
implementation("io.ktor:ktor-client-content-negotiation:$ktorVersion")
implementation("io.ktor:ktor-serialization-kotlinx-json:$ktorVersion")

// 平台特定引擎依赖
androidImplementation("io.ktor:ktor-client-okhttp:$ktorVersion")
iosImplementation("io.ktor:ktor-client-darwin:$ktorVersion")
jsImplementation("io.ktor:ktor-client-js:$ktorVersion")
```

**配置单例客户端**:
```kotlin
val httpClient = HttpClient {
    install(ContentNegotiation) {
        json(Json { ignoreUnknownKeys = true })
    }
    // 日志拦截器等
}
```

### 4.2 数据存储
*   **轻量级键值对**: 使用 **[Multiplatform Settings](https://github.com/russhwolf/multiplatform-settings)**。它封装了 Android 的 SharedPreferences/DataStore 和 iOS 的 UserDefaults。
*   **关系型数据库**: **SQLDelight** 是首选。它生成类型安全的 Kotlin API，支持 Android (SQLite), iOS (SQLite), Desktop (SQLite/MySQL/PostgreSQL)。
    *   *Room Multiplatform*: 截至 2026 年，Jetpack Room 的多平台支持仍处于 Alpha/Beta 阶段，生产环境建议优先选用 SQLDelight 或 ObjectBox。

### 4.3 依赖注入：Koin
**Koin** 是最流行的 KMP 兼容 DI 框架，因为它基于纯 Kotlin，无需注解处理器（KAPT/KSP），编译速度快。

```kotlin
// commonMain
val appModule = module {
    single { HttpClientProvider().createClient() }
    factory { Repository(get()) }
    viewModel { MainViewModel(get()) } // 如果使用 Compose MP
}
```
*   **初始化**: 在 Android `Application` 和 iOS `AppDelegate` 中分别调用 `startKoin { modules(appModule) }`。

### 4.4 异步编程：Flow
使用 `StateFlow` 和 `SharedFlow` 作为状态管理的核心。
*   **ViewModel**: 在 `commonMain` 中定义 ViewModel，继承自 `ViewModel` (来自 `androidx.lifecycle:lifecycle-viewmodel-compose` 的多平台版本或 KMP 专用库)。
*   **生命周期**: 确保协程在 ViewModel 清除时取消，避免内存泄漏。

---

## 5. UI 层开发策略

### 5.1 策略一：原生 UI + 共享逻辑 (传统模式)
*   **Android**: 使用 Jetpack Compose (Native)。直接从 `shared` 模块获取 ViewModel。
*   **iOS**: 使用 SwiftUI。
    *   需要将 Kotlin 类暴露给 Swift。Kotlin/Native 会自动生成 `.framework`。
    *   **痛点**: 类型转换。Kotlin `List<String>` 变成 Swift `[String]`，但 `Map` 和复杂对象可能需要手动映射或使用辅助函数。
    *   **数据流**: 在 Swift 中观察 Kotlin Flow 需要使用桥接库（如 `KotlinCoroutinesBridge`）将其转换为 Combine `Publisher` 或 Swift `AsyncStream`。

### 5.2 策略二：Compose Multiplatform (2026 主流推荐)
这是目前效率最高的方案。

*   **基础组件**: `Text`, `Button`, `Column`, `Row` 等在所有平台行为一致。
*   **平台特定修饰符**:
    ```kotlin
    Modifier
        .fillMaxWidth()
        .then(if (isIOS) Modifier.iosSafeAreaPadding() else Modifier.padding(16.dp))
    ```
*   **导航**: 使用 **Navigation Compose**。路由字符串在所有平台通用。
*   **iOS 集成细节**:
    *   Compose MP 在 iOS 上通过 `UIViewControllerRepresentable` 嵌入 SwiftUI。
    *   **键盘处理**: 使用 `WindowInsets.ime` 自动处理键盘弹出遮挡问题。
    *   **滚动**: Compose 的 LazyColumn 在 iOS 上模拟了原生滚动效果（包括弹性回弹）。

### 5.3 Web 与桌面端
*   **Web (Wasm)**: Compose for Web (Wasm) 允许将 Compose UI 编译为 Wasm，在浏览器中运行。性能优于旧版 JS Compose。
*   **Desktop**: Compose for Desktop 使用 Skia 进行渲染。可以打包为 `.exe`, `.dmg`, `.deb`。适合内部工具或跨桌面应用。

---

## 6. 平台互操作性 (Interoperability)

### 6.1 Kotlin/Native 与 iOS (Swift/ObjC)
*   **框架生成**: Gradle 任务 `linkDebugFrameworkIosArm64` 会生成 `.framework`。
*   **类型映射**:
    *   Kotlin `String` <-> Swift `String`
    *   Kotlin `Int` <-> Swift `Int32` (注意精度)
    *   Kotlin `List` <-> Swift `NSArray` (通常转换为 `[Any]`)
    *   Kotlin `Sealed Class` <-> Swift `Enum` (有限支持，复杂层级可能退化为 ObjC 协议)
*   **内存管理**:
    *   Kotlin/Native 现在使用 **新的内存管理器 (New MM)**，默认启用。它支持对象在多线程间自由传递，解决了旧版 MM 的严格线程隔离问题。
    *   **循环引用**: 仍需注意 Kotlin 对象持有 Swift 闭包，Swift 闭包又持有 Kotlin 对象的情况。使用 `[weak self]` 或在 Kotlin 侧使用 `WeakReference`。

### 6.2 Kotlin/JVM 与 Android
*   无缝集成。`shared` 模块编译为 AAR。
*   **ProGuard/R8**: 需要在 Android App 的 `proguard-rules.pro` 中保留 Kotlin 反射和序列化相关的类。

### 6.3 Kotlin/JS 与 JavaScript
*   使用 `external` 关键字声明 JS 函数。
*   **npm 依赖**: 可以在 Gradle 中直接引入 npm 包，Kotlin/JS 编译器会处理绑定。

---

## 7. 测试策略

### 7.1 单元测试 (Common Test)
*   在 `commonTest` 中编写测试，使用 `kotlin.test` 断言库。
*   这些测试会在 JVM、Android、iOS 模拟器等多个环境中运行。
*   **Mocking**: 使用 **MockK** (支持多平台) 或手动实现 Fake 接口。

### 7.2 平台特定测试
*   **Android**: 标准的 Instrumented Tests (`androidTest`)。
*   **iOS**: 可以编写 XCTest，调用 Kotlin 生成的 Framework 进行测试。但更常见的做法是在 `iosTest` 源集中使用 Kotlin 编写测试，并由 Gradle 驱动在模拟器上运行。

### 7.3 UI 测试
*   **Compose Multiplatform**: 使用 `compose-ui-test`。它可以针对 Android 和 Desktop 进行截图测试和交互测试。
*   **iOS UI 测试**: 目前主要依赖 Xcode 的原生 UI 测试，或者使用 Detox 等第三方工具。Compose MP 的 iOS UI 测试支持正在不断完善中。

---

## 8. 工程化与 CI/CD

### 8.1 Gradle 构建优化
*   **Configuration Cache**: 务必启用 `org.gradle.configuration-cache=true`，大幅缩短配置阶段时间。
*   **K2 Compiler**: 启用新的 Kotlin K2 编译器 (`languageSettings.useK2 = true`)，提供更快的编译速度和更好的错误提示。
*   **并行构建**: `org.gradle.parallel=true`。

### 8.2 持续集成 (CI)
*   **GitHub Actions / GitLab CI**:
    *   需要 macOS Runner 来构建和测试 iOS 部分。这是成本大头。
    *   **策略**: 仅在 PR 合并到 main 分支或 Release 标签触发时运行完整的 iOS 构建和测试。日常 PR 只运行 Android、JVM 和 Common 测试。
*   **缓存**: 使用 Gradle Build Cache 和 CocoaPods/Swift Package Manager 缓存。

### 8.3 发布管理
*   **Maven Central**: 发布 `shared` 模块的 AAR 和 KLib。
*   **SPM (Swift Package Manager)**: 2026 年的最佳实践是将 Kotlin/Native 框架包装为 SPM 包，方便 iOS 开发者集成。Kotlin 官方插件支持直接生成 SPM 兼容的结构。

---

## 9. 高级主题与性能优化

### 9.1 性能调优
*   **启动时间**: Kotlin/Native 的二进制初始化有开销。使用 `initWith` 延迟初始化非必要模块。
*   **包体积**:
    *   启用 R8/ProGuard 进行 Tree Shaking。
    *   移除未使用的 Ktor 引擎和序列化格式。
    *   iOS Framework 可以使用 Bitcode 压缩。
*   **内存**: 使用 Android Profiler 和 Xcode Instruments 监控内存。注意 Kotlin 协程在后台线程的生命周期。

### 9.2 架构模式：MVI + Clean Architecture
*   **Common Layer**:
    *   `Domain`: UseCases, Entities (纯 Kotlin)。
    *   `Data`: Repositories, DataSources (Ktor, SQLDelight)。
    *   `Presentation`: ViewModels, State/UI States (Flow)。
*   **UI Layer**:
    *   Android/iOS/Desktop 仅负责渲染 State 和发送 Intent。

### 9.3 第三方库生态 (2026 推荐)
*   **Network**: Ktor
*   **DI**: Koin
*   **Database**: SQLDelight
*   **Image Loading**: Coil (Coil 3+ 完美支持 KMP 和 Compose MP)
*   **Navigation**: Voyager (轻量级) 或 Navigation Compose (官方)
*   **Date/Time**: kotlinx-datetime (取代 java.time/threetenbp)

---

## 10. 实战项目案例思路

### 案例：多平台笔记应用 (NoteMaster)
1.  **Shared 模块**:
    *   定义 `Note` 数据类。
    *   `NoteRepository` 接口。
    *   `SqlDelightNoteDataSource` 实现数据库 CRUD。
    *   `NoteViewModel` 暴露 `StateFlow<List<Note>>`。
2.  **Android App**:
    *   Jetpack Compose UI。
    *   订阅 ViewModel，显示列表。
    *   点击添加跳转详情页。
3.  **iOS App**:
    *   SwiftUI List。
    *   通过 `KotlinCoroutinesBridge` 将 Flow 转为 `@Published` 属性。
    *   或者直接采用 **Compose Multiplatform**，共用 UI 代码。
4.  **亮点**:
    *   离线优先：数据先存本地 SQLite，后台同步（模拟）。
    *   深色模式：在 `common` 中定义主题颜色，各平台适配。

---

## 11. 常见陷阱与 FAQ

1.  **线程模型**:
    *   *问题*: 在 iOS 上更新 UI 必须在 Main Thread。
    *   *解决*: Compose MP 和 Ktor 内部已处理大部分情况。手动调用原生 API 时，务必使用 `Dispatchers.Main`。
2.  **日期时间**:
    *   *问题*: `java.util.Date` 不可用。
    *   *解决*: 始终使用 `kotlinx-datetime`。
3.  **浮点数精度**:
    *   *问题*: 不同平台浮点运算可能有微小差异。
    *   *解决*: 金融计算务必使用 `BigDecimal` (需引入特定库) 或以整数（分）为单位存储。
4.  **Gradle 同步慢**:
    *   *解决*: 检查网络代理（下载 Gradle 依赖和 CocoaPods）。使用国内镜像源。启用 Configuration Cache。
5.  **iOS 模拟器 vs 真机**:
    *   *问题*: 架构不同 (x86_64 vs arm64)。
    *   *解决*: Gradle 会自动处理。确保 Xcode Scheme 设置正确。调试时，Xcode 附加到进程即可断点 Kotlin 代码（需配置 dSYM）。

---