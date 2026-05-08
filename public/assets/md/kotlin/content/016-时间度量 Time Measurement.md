# 时间度量 (Time Measurement)

## 1. 为什么 `System.currentTimeMillis()` 不适合测耗时？

*   **墙壁时间 (Wall-Clock Time)**: `currentTimeMillis()` 返回的是自 1970-01-01 UTC 以来的毫秒数。它反映的是“现在几点了”。
*   **不稳定性**:
    *   **NTP 同步**: 操作系统会定期通过网络时间协议校正时钟。如果校正导致时钟回拨，测得的耗时可能是负数！如果时钟向前跳变，耗时会突然变大。
    *   **闰秒**: 虽然罕见，但会影响绝对时间。
    *   **用户修改**: 用户可以手动更改系统时间。
*   **适用场景**: 记录日志时间戳、显示给用户看的时间、持久化存储的时间点。**绝不用于计算两个事件之间的间隔**。

## 2. 黄金标准：`System.nanoTime()`

*   **单调时间 (Monotonic Time)**: `nanoTime()` 返回的是某个固定起点（通常是 JVM 启动或系统启动）之后的纳秒数。
*   **特性**:
    *   **不可逆**: 时间只会增加，不会减少（不受 NTP 影响）。
    *   **高精度**: 纳秒级分辨率（虽然实际硬件精度可能在微秒级，但接口提供纳秒）。
    *   **相对值有意义**: `endTime - startTime` 才是有效的耗时。单独的 `nanoTime()` 值没有任何物理意义。
*   **注意**: 即使 `nanoTime` 也可能受 CPU 频率调整影响（在现代 OS 和 JVM 中已大部分通过硬件计数器解决），但对于应用层性能监控，它是唯一可靠的选择。

## 3. Kotlin 标准库的优雅封装

Kotlin 提供了更语义化的 API，底层均基于 `System.nanoTime()`。

### 3.1 `measureTimeMillis` & `measureNanoTime`
这是最通用的测量工具。

```kotlin
import kotlin.system.measureTimeMillis
import kotlin.system.measureNanoTime

// 场景：监控 API 响应时间
val responseTimeMs = measureTimeMillis {
    val data = apiClient.fetchData()
    process(data)
}
logger.info("API call took $responseTimeMs ms")

// 场景：极高精度算法比对
val diff = measureNanoTime {
    algorithmA(input)
}
```

### 3.2 `kotlin.time.Duration` (类型安全的时间)
从 Kotlin 1.6 开始稳定，推荐使用 `Duration` 替代原始的 `Long` 毫秒/纳秒数，以消除单位混淆。

*   **创建 Duration**:
    ```kotlin
    import kotlin.time.Duration.Companion.seconds
    import kotlin.time.Duration.Companion.milliseconds
    
    val timeout = 5.seconds
    val delay = 500.milliseconds
    val complex = 1.minutes + 30.seconds
    ```

*   **`measureTime`**: 返回 `Duration` 对象，而非 Long。
    ```kotlin
    import kotlin.time.measureTime
    
    val duration: Duration = measureTime {
        heavyTask()
    }
    
    // 丰富的 API
    println(duration.inWholeMilliseconds) // Long
    println(duration.toDouble(DurationUnit.SECONDS)) // Double
    if (duration > 3.seconds) { ... } // 直观的比较
    ```

## 4. 实际应用场景深入

### A. 性能基准测试 (Benchmarking) 的误区
*   **JVM 的 JIT 编译**: Java/Kotlin 代码在运行初期是解释执行的，热点代码会被 JIT 编译为本地机器码。因此，前几次调用通常很慢。
*   **GC 干扰**: 垃圾回收器的随机暂停会影响单次测量。
*   **正确做法**:
    1.  **Warm-up**: 先运行目标代码几千次，让 JIT 完成优化。
    2.  **多次测量**: 运行数千次，取平均值或中位数。
    3.  **使用 JMH**: 对于严肃的性能测试，**不要手写循环**。使用 [JMH (Java Microbenchmark Harness)](https://openjdk.org/projects/code-tools/jmh/)。Kotlin 项目可以轻松集成 JMH。
    
    *Gradle 配置简述*:
    ```groovy
    plugins {
        id 'me.champeau.jmh' version '0.7.2'
    }
    // JMH 会自动处理预热、迭代、 fork 进程等复杂逻辑
    ```

### B. 协程中的超时控制
在异步编程中，时间度量常用于超时切断。

```kotlin
import kotlinx.coroutines.withTimeout
import kotlinx.coroutines.withTimeoutOrNull

suspend fun fetchDataWithTimeout() {
    try {
        // 如果 3 秒内未完成，抛出 TimeoutCancellationException
        val result = withTimeout(3000) {
            api.call()
        }
    } catch (e: TimeoutCancellationException) {
        logger.warn("Request timed out")
    }
    
    // 或者使用OrNull，超时返回 null，不抛异常
    val result = withTimeoutOrNull(3.seconds) {
        api.call()
    }
    if (result == null) handleTimeout()
}
```
*注意*: `withTimeout` 使用的是协程调度器的时钟，通常也是基于单调时间，但在某些自定义 Dispatcher 下需确认其行为。

### C. Android 平台的特殊性
Android 设备会进入深度睡眠（Doze 模式），CPU 可能停止工作。

*   `System.nanoTime()`: 在 Android 上通常基于 `CLOCK_MONOTONIC`，**不包括**深度睡眠时间。如果你测量的是“CPU 处理耗时”，这是对的。但如果你测量的是“用户感知的经过时间”（例如倒计时），它不准。
*   `SystemClock.elapsedRealtime()`: 包括深度睡眠时间。适合测量“从按下按钮到屏幕亮起”的真实物理时间。
*   `SystemClock.uptimeMillis()`: 不包括深度睡眠。适合衡量 CPU 活跃期间的性能。

**建议**:
*   性能分析 (Profiling): 用 `nanoTime` 或 `measureTime`。
*   业务逻辑超时 (如会话过期): 用 `currentTimeMillis` (因为服务器时间也是墙壁时间)。
*   UI 动画/倒计时: 用 `elapsedRealtime`。

## 5. 常见误区总结

1.  **误用 `currentTimeMillis` 做减法**: 这是最常见的 Bug 来源之一，尤其在分布式系统或长时间运行的服务中。
2.  **忽略单位**: 在日志中打印 `100` 而不注明是 ms 还是 ns。使用 `Duration` 类可以强制携带单位信息。
3.  **在生产环境过度打点**: `measureTime` 虽然有 inline 优化，但频繁的日志 I/O 才是性能杀手。建议在开发/测试环境开启详细计时，生产环境仅对关键路径采样。
4.  **认为 `nanoTime` 是绝对时间**: 永远不要将 `nanoTime()` 的值存入数据库或发送给其他机器，因为它在其他 JVM 或重启后毫无意义。

---