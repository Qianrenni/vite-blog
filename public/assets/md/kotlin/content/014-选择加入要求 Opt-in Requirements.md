# 选择加入要求 (Opt-in Requirements)

Kotlin 的语言演进非常快，为了在不破坏稳定性的前提下引入新特性，引入了 **Opt-in 机制**。这不仅是注解，更是一种契约。

## 1. 核心概念

*   **实验性 API (Experimental API)**: 标记为 `@RequiresOptIn` 的 API。它们可能随时更改名称、签名或被移除。
*   **选择加入 (Opt-in)**: 开发者必须显式声明“我知道这个 API 不稳定，我同意承担风险”，编译器才会允许编译通过。
*   **目的**:
    1.  **隔离风险**: 防止实验性代码污染整个项目。
    2.  **反馈循环**: 鼓励早期用户试用并反馈 Bug。
    3.  **清晰边界**: 在代码审查中，`@OptIn` 是一个明显的信号，提示审查者注意潜在的不稳定性。

## 2. 核心注解详解

### 2.1 `@RequiresOptIn` (定义者使用)
库作者使用此注解标记自己的 API。

```kotlin
// 库作者代码
@RequiresOptIn(
    level = RequiresOptIn.Level.WARNING, // 或 ERROR
    message = "This API is experimental. It may change in future releases."
)
annotation class MyExperimentalApi

@MyExperimentalApi
fun experimentalFeature() {
    println("This is experimental!")
}
```

### 2.2 `@OptIn` (使用者使用)
应用开发者使用此注解来启用实验性 API。

```kotlin
// 应用开发者代码
import kotlin.OptIn

// 方式 1: 函数级别 (推荐，影响范围最小)
@OptIn(MyExperimentalApi::class)
fun useExperimentalFeature() {
    experimentalFeature()
}

// 方式 2: 类级别
@OptIn(MyExperimentalApi::class)
class MyClass {
    fun doSomething() {
        experimentalFeature()
    }
}

// 方式 3: 文件级别 (影响整个文件)
@file:OptIn(MyExperimentalApi::class)

// 方式 4: 模块级别 (Gradle/Maven 配置，影响整个模块)
```

### 2.3 常见官方实验性 API 示例
*   **`kotlin.time.ExperimentalTime`**: 用于 `Duration` 和 `measureTimeMillis` 等新时间 API（在 Kotlin 1.6+ 中已逐渐稳定，部分不再需要 Opt-in，但旧代码中常见）。
*   **`kotlinx.coroutines.ExperimentalCoroutinesApi`**: 协程中的新操作符或调度器特性。
*   **`kotlin.experimental.ExperimentalNativeApi`**: Kotlin/Native 特定功能。

## 3. 配置与管理实战

### 3.1 Gradle 配置 (Kotlin DSL)
如果你希望在**整个模块**中启用某个实验性 API（例如，你的项目重度依赖某个实验性功能），可以在 `build.gradle.kts` 中配置：

```kotlin
kotlin {
    sourceSets.all {
        languageSettings {
            // 启用特定的实验性 API
            optIn("kotlin.time.ExperimentalTime")
            optIn("kotlinx.coroutines.ExperimentalCoroutinesApi")
            
            // 启用所有实验性 API (不推荐，除非是测试项目)
            // progressiveMode = true 
        }
    }
}
```

### 3.2 Maven 配置
在 `pom.xml` 的 `kotlin-maven-plugin` 配置中：

```xml
<configuration>
    <args>
        <arg>-opt-in=kotlin.time.ExperimentalTime</arg>
        <arg>-opt-in=kotlinx.coroutines.ExperimentalCoroutinesApi</arg>
    </args>
</configuration>
```

### 3.3 IDE 支持
*   **IntelliJ IDEA**: 当你调用一个需要 Opt-in 的 API 时，IDE 会标红或黄色警告。
*   **快速修复**: 将光标放在错误处，按 `Alt+Enter` (Windows/Linux) 或 `Option+Enter` (Mac)，IDE 会自动添加 `@OptIn` 注解或建议修改 Gradle 配置。

## 4. 最佳实践与注意事项

### 4.1 作用域最小化原则
*   **优先函数级**: 只在真正使用实验性 API 的函数上加 `@OptIn`。
*   **避免文件级/模块级**: 除非该实验性 API 已成为项目核心且团队达成一致，否则不要全局启用。全局启用会掩盖其他潜在的实验性 API 使用，降低代码的可维护性。

### 4.2 生产环境风险评估
*   **关键路径慎用**: 不要在核心业务逻辑、高并发服务的关键路径中使用实验性 API，除非你有充分的测试和回滚计划。
*   **替代方案**: 检查是否有稳定的替代方案。例如，早期 `Duration` 是实验性的，现在已稳定，应移除 `@OptIn`。

### 4.3 版本升级与维护
*   **定期清理**: 每次升级 Kotlin 版本后，检查 Release Notes。很多实验性 API 会转为稳定（Stable）。一旦稳定，`@OptIn` 注解就不再需要，应及时移除以保持代码整洁。
*   **Breaking Changes**: 如果实验性 API 被移除或签名大幅变更，编译器会报错。此时需要根据新文档重构代码。

### 4.4 自定义实验性 API (库开发者视角)
如果你是库作者，希望发布一个新功能但不想承诺长期兼容：

```kotlin
@RequiresOptIn(level = RequiresOptIn.Level.ERROR, message = "Deep learning features are experimental.")
annotation class ExperimentalDL

@ExperimentalDL
fun trainModel() { ... }
```
*   **Level.ERROR**: 强制使用者必须显式 Opt-in，否则编译失败。适用于高风险 API。
*   **Level.WARNING**: 仅给出警告，允许编译。适用于低风险或即将稳定的 API。

---

## 总结

*   **I/O 模块**: 掌握 `println`/`print` 的输出技巧，熟练运用 `readln` 结合 `split`/`map` 处理复杂输入，理解 `Scanner` 的适用场景。重点在于**利用 Kotlin 的空安全和集合操作简化输入解析逻辑**。
*   **Opt-in 模块**: 理解这是 Kotlin 平衡**创新**与**稳定**的机制。作为使用者，要遵循**最小作用域原则**；作为库作者，要合理使用 `@RequiresOptIn` 保护用户。随着 Kotlin 版本的迭代，保持对 API 稳定状态的关注是日常维护的一部分。
这是一份经过深度完善和详细讲解的大纲内容。我将原有的要点扩展为**教学级**的详细笔记，增加了底层原理、代码对比、易错点分析以及 2026 年视角下的现代 Kotlin 最佳实践。

---