# Kotlin 常用库

## 1. Kotlin 标准库 (kotlin-stdlib)
> **定位**：Kotlin 语言的基石。无论你在 JVM、Android、JS 还是 Native 平台开发，这部分 API 都是统一且默认可用的。

### 1.1 集合操作 (Collections)
Kotlin 区分了**只读（Read-only）**和**可变（Mutable）**集合接口，这是防止副作用的关键设计。

*   **不可变 vs 可变**：
    *   `List<T>` / `MutableList<T>`
    *   `Set<T>` / `MutableSet<T>`
    *   `Map<K, V>` / `MutableMap<K, V>`
    *   *最佳实践*：函数参数尽量接收只读接口，仅在内部需要修改时才转换为 mutable 版本。

*   **高阶函数实战**：
    ```kotlin
    val numbers = listOf(1, 2, 3, 4, 5, 6)

    // map: 转换元素
    val doubled = numbers.map { it * 2 } // [2, 4, 6, 8, 10, 12]

    // filter: 过滤元素
    val evens = numbers.filter { it % 2 == 0 } // [2, 4, 6]

    // flatMap: 扁平化映射（常用于嵌套集合）
    val lists = listOf(listOf(1, 2), listOf(3, 4))
    val flat = lists.flatMap { it } // [1, 2, 3, 4]

    // fold/reduce: 聚合操作
    val sum = numbers.fold(0) { acc, i -> acc + i } // 初始值为0的累加
    val product = numbers.reduce { acc, i -> acc * i } // 无初始值，直接用前两个元素开始
    ```

*   **序列 (Sequences)**：
    *   **原理**：`Sequence` 是惰性求值的。中间操作（如 `map`, `filter`）不会立即执行，直到终端操作（如 `toList`, `first`）触发。
    *   **场景**：处理大型数据集或无限流时，避免创建大量中间临时集合，节省内存。
    ```kotlin
    val sequence = sequenceOf(1, 2, 3, 4, 5)
        .map { 
            println("Mapping $it") 
            it * 2 
        }
        .filter { 
            println("Filtering $it") 
            it > 4 
        }
    
    // 此时没有任何打印输出
    val firstResult = sequence.first() 
    // 输出: Mapping 1, Filtering 2, Mapping 2, Filtering 4, Mapping 3, Filtering 6 -> 返回 6
    ```

### 1.2 空安全与类型检查
*   **Elvis 运算符 (`?:`)**：提供默认值。
    ```kotlin
    val name: String? = null
    val displayName = name ?: "Guest" // 如果 name 为 null，则使用 "Guest"
    ```
*   **智能转换 (Smart Casts)**：
    ```kotlin
    fun printLength(obj: Any) {
        if (obj is String) {
            // 编译器自动将 obj 视为 String，无需 obj as String
            println(obj.length) 
        }
    }
    ```
*   **作用域函数选择指南**：
    | 函数 | 上下文对象引用 | 返回值 | 典型用途 |
    | :--- | :---: | :---: | :--- |
    | `let` | `it` | Lambda 结果 | 空安全调用 (`obj?.let {}`)，变量作用域限制 |
    | `run` | `this` | Lambda 结果 | 对象配置并计算结果 |
    | `with` | `this` | Lambda 结果 | 对同一对象执行多个操作（非扩展函数） |
    | `apply` | `this` | 对象本身 | 对象初始化/配置 (Builder 模式) |
    | `also` | `it` | 对象本身 | 副作用操作（如日志打印），不改变对象 |

### 1.3 字符串与文本处理
*   **字符串模板**：支持任意表达式。
    ```kotlin
    val price = 100
    println("The price is \$${price * 1.1}") // The price is $110.0
    ```
*   **Regex**：
    ```kotlin
    val regex = """(\d{4})-(\d{2})-(\d{2})""".toRegex()
    val match = regex.find("2023-10-05")
    if (match != null) {
        println(match.groupValues[1]) // 2023
    }
    ```

### 1.4 协程基础支持 (Stdlib 中的挂起概念)
虽然协程实现在 `kotlinx-coroutines`，但 `suspend` 关键字和基础接口在 stdlib 中定义。
*   **Suspend Function**：可以在不阻塞线程的情况下暂停执行。
*   **注意**：`runBlocking` 仅用于测试或桥接同步/异步代码，严禁在 Android Main 线程或服务器请求处理线程中直接使用，否则会导致卡顿。

---

## 2. 序列化 (kotlinx.serialization)
> **定位**：JetBrains 官方出品，编译期生成代码，性能优于反射方案（Gson/Jackson），且完美支持 Kotlin 特有类型（如 data class, sealed class）。

### 2.1 核心配置
需要在 `build.gradle.kts` 中添加插件：
```kotlin
plugins {
    kotlin("plugin.serialization") version "1.9.0"
}
dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
}
```

### 2.2 JSON 处理实战
*   **基本用法**：
    ```kotlin
    @Serializable
    data class User(val name: String, val age: Int)

    val user = User("Alice", 30)
    val json = Json.encodeToString(user) // {"name":"Alice","age":30}
    val decoded = Json.decodeFromString<User>(json)
    ```

*   **关键配置 (`Json` 实例)**：
    ```kotlin
    val format = Json {
        ignoreUnknownKeys = true // 后端多发了字段，前端不会崩溃
        encodeDefaults = false   // 如果字段值等于默认值，序列化时省略该字段，减小体积
        prettyPrint = true       // 格式化输出，便于调试
        isLenient = true         // 允许非严格 JSON（如注释、尾随逗号）
    }
    ```

*   **自定义序列化器**：
    当需要处理非标准格式（如将 Date 存为时间戳字符串）时：
    ```kotlin
    object DateSerializer : KSerializer<Date> {
        override val descriptor = PrimitiveSerialDescriptor("Date", PrimitiveKind.LONG)
        override fun serialize(encoder: Encoder, value: Date) {
            encoder.encodeLong(value.time)
        }
        override fun deserialize(decoder: Decoder): Date {
            return Date(decoder.decodeLong())
        }
    }
    
    @Serializable
    data class Event(@Serializable(with = DateSerializer::class) val timestamp: Date)
    ```

### 2.3 多态序列化
处理继承结构时，必须指定鉴别器（Discriminator）：
```kotlin
@Serializable
sealed class Shape {
    @Serializable
    data class Circle(val radius: Double) : Shape()
    
    @Serializable
    data class Rectangle(val width: Double, val height: Double) : Shape()
}

// 序列化结果: {"type":"Circle","radius":5.0}
val json = Json { classDiscriminator = "type" }.encodeToString(Shape.Circle(5.0))
```

---

## 3. I/O 库 (kotlinx-io)
> **定位**：新一代多平台 I/O。相比 `java.io`，它更安全（自动资源管理）、更高效（Buffer 池）、更统一（跨平台 API 一致）。

### 3.1 核心抽象
*   **Buffer**：内部维护字节数组，支持动态扩容。它是 `Source` 和 `Sink` 背后的存储引擎。
*   **Source**：数据源（类似 InputStream），提供 `readByte`, `readShort`, `readUtf8Line` 等类型安全读取方法。
*   **Sink**：数据目的地（类似 OutputStream），提供 `writeByte`, `writeString` 等方法。

### 3.2 文件操作示例
```kotlin
import kotlinx.io.Files
import kotlinx.io.readString
import kotlinx.io.writeString

// 写入文件
val path = Path("test.txt")
Files.sink(path).buffer().use { sink ->
    sink.writeString("Hello, Kotlin IO!")
}

// 读取文件
val content = Files.source(path).buffer().use { source ->
    source.readString()
}
println(content)
```
*注意：`use` 块确保了流在使用后自动关闭，避免资源泄漏。*

### 3.3 为什么选择 kotlinx-io？
1.  **多平台**：在 iOS (Native) 和 JS 上也能用同样的 API 读写文件/内存。
2.  **结构化**：不再需要手动处理 `byte[]` 数组越界问题。
3.  **协程友好**：虽然核心是阻塞式 API，但设计上易于封装为 suspend 函数，且正在逐步原生支持异步 I/O。

---

## 4. 日期与时间 (kotlinx-datetime)
> **定位**：解决 `java.util.Date` 和 `Calendar` 的设计缺陷（可变性、月份从0开始、时区混乱）。API 风格接近 Java 8 `java.time` 但更简洁，且支持多平台。

### 4.1 核心类型解析
*   **Instant**：精确到纳秒的时间点，始终基于 UTC。适合存储数据库、网络传输。
*   **LocalDateTime**：日历上的“墙钟时间”，不包含时区信息。适合展示给用户看（如“会议在下午3点”）。
*   **TimeZone**：时区规则集合。

### 4.2 常见操作
```kotlin
import kotlinx.datetime.*

// 1. 获取当前时间
val now = Clock.System.now() // Instant

// 2. 转换为本地时间 (例如上海时区)
val shanghaiZone = TimeZone.of("Asia/Shanghai")
val localDt = now.toLocalDateTime(shanghaiZone)

// 3. 构造特定时间
val birthday = LocalDate(1990, Month.MAY, 9)

// 4. 时间运算
val nextWeek = Clock.System.now().plus(7, DateTimeUnit.DAY)

// 5. 计算两个日期的间隔
val period = birthday.periodUntil(LocalDate(2026, Month.MAY, 9), shanghaiZone)
println("${period.years} years") // 36 years
```

### 4.3 格式化
kotlinx-datetime 本身不提供复杂的 `SimpleDateFormat` 式格式化，建议配合 `kotlinx-datetime-serialization` 或使用 ISO 8601 标准字符串交互。如果需要复杂格式化，JVM 上可转回 `java.time` 处理。

---

## 5. 并发与异步 (kotlinx-coroutines)
> **定位**：Kotlin 异步编程的灵魂。通过“挂起”而非“回调”来解决地狱嵌套问题。

### 5.1 结构化并发 (Structured Concurrency)
核心原则：**协程的生命周期与其 Scope 绑定**。父协程取消，子协程自动取消；子协程抛出异常，父协程感知。

*   **Scope 选择**：
    *   `viewModelScope` (Android): 随 ViewModel 销毁而取消。
    *   `lifecycleScope` (Android): 随 Activity/Fragment 生命周期取消。
    *   `CoroutineScope(Dispatchers.IO)`: 后台任务。
    *   `supervisorScope`: 子协程失败不影响其他子协程（适用于并行独立任务）。

### 5.2 Flow：冷数据流
Flow 是响应式流的 Kotlin 实现，支持背压（Backpressure）。

```kotlin
// 定义一个 Flow
fun observeNumbers(): Flow<Int> = flow {
    for (i in 1..5) {
        delay(1000) // 模拟耗时操作
        emit(i)
    }
}

// 收集 Flow
lifecycleScope.launch {
    observeNumbers()
        .filter { it % 2 == 0 }
        .map { "Number: $it" }
        .flowOn(Dispatchers.Default) // 切换上游执行线程
        .collect { text ->
            println(text) // 在主线程更新 UI
        }
}
```

*   **StateFlow vs SharedFlow**:
    *   `StateFlow`: 有初始值，只保留最新值，适合状态管理（UI State）。
    *   `SharedFlow`: 无初始值，可配置回放，适合事件总线（One-time events）。

### 5.3 异常处理
在协程中，未捕获的异常会取消整个 Scope。
```kotlin
supervisorScope {
    launch {
        try {
            doNetworkRequest()
        } catch (e: IOException) {
            // 处理异常，防止 Scope 被取消
        }
    }
    launch {
        doAnotherTask() // 即使上一个失败，这个也会继续运行
    }
}
```

---

## 6. 依赖注入 (Koin / Hilt)

### 6.1 Koin (推荐用于多平台/轻量级项目)
*   **特点**：纯 Kotlin 编写，无代码生成，启动快，DSL 易读。
*   **定义模块**：
    ```kotlin
    val appModule = module {
        single { Repository() } // 单例
        factory { Service(get()) } // 每次注入创建新实例，get() 自动注入 Repository
    }
    ```
*   **注入**：
    ```kotlin
    class MyViewModel : ViewModel() {
        private val repo: Repository by inject()
    }
    ```

### 6.2 Hilt (推荐用于大型 Android 项目)
*   **特点**：基于 Dagger，编译期生成代码，性能极致，强类型检查，但配置稍繁琐。
*   **优势**：与 Android 生命周期组件（Activity, Fragment, Service）无缝集成。

---

## 7. 网络请求 (Ktor Client / Retrofit)

### 7.1 Ktor Client (多平台首选)
*   **异步天然支持**：所有请求函数都是 `suspend`。
*   **插件化架构**：
    ```kotlin
    val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json { ignoreUnknownKeys = true })
        }
        install(Logging) {
            level = LogLevel.BODY
        }
    }
    
    // 发起请求
    val user: User = client.get("https://api.example.com/user/1").body()
    ```

### 7.2 Retrofit (JVM/Android 传统强者)
*   **优势**：生态极其丰富，注解式定义清晰。
*   **结合 Coroutines**：
    ```kotlin
    interface ApiService {
        @GET("user/{id}")
        suspend fun getUser(@Path("id") userId: String): User
        
        @GET("users")
        fun getUsers(): Flow<List<User>> // 返回 Flow
    }
    ```

---

## 8. 测试库 (kotest / Mockk)

### 8.1 Kotest
比 JUnit 更强大的测试框架，支持多种测试风格。
*   **StringSpec 示例**：
    ```kotlin
    class MyTest : StringSpec({
        "length should return size of string" {
            "hello".length shouldBe 5
        }
        "startswith should match" {
            "hello world" should startWith("hello")
        }
    })
    ```

### 8.2 Mockk
专为 Kotlin 设计的 Mock 库，完美支持协程和扩展函数。
*   **基本用法**：
    ```kotlin
    interface Repo {
        suspend fun fetchUser(id: Int): User
    }

    @Test
    fun testViewModel() = runTest {
        val mockRepo = mockk<Repo>()
        val fakeUser = User("Test", 20)
        
        //  stubbing
        coEvery { mockRepo.fetchUser(1) } returns fakeUser
        
        val vm = MyViewModel(mockRepo)
        vm.loadUser(1)
        
        // verification
        coVerify { mockRepo.fetchUser(1) }
    }
    ```
    *注意：Mock 协程函数时使用 `coEvery` 和 `coVerify`。*