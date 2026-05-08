# Kotlin协程
## 协程基础

### 1. 协程概念

#### 轻量级线程的本质
协程（Coroutines）是 Kotlin 提供的一种轻量级的并发编程解决方案。它们不是操作系统级别的线程，而是运行在用户空间的轻量级执行单元。

**协程的特点：**
- **轻量级**：单个线程可以运行数千个协程，而创建线程通常限制在数百个
- **非阻塞**：协程可以在不阻塞线程的情况下暂停和恢复执行
- **结构化并发**：提供清晰的作用域管理和错误处理机制

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    // 启动10万个协程
    repeat(100_000) {
        launch {
            delay(1000L) // 每个协程延迟1秒
            print(".")
        }
    }
}
```

#### 挂起与恢复机制
协程的核心机制是挂起（Suspension）和恢复（Resumption）。当协程遇到挂起函数时，它不会阻塞线程，而是将当前执行状态保存起来，让出线程给其他任务使用，稍后可以从挂起点继续执行。

```kotlin
suspend fun fetchData(): String {
    println("开始获取数据...")
    delay(2000L) // 挂起点，线程可以执行其他任务
    println("数据获取完成")
    return "数据内容"
}

suspend fun processData(): String {
    println("开始处理数据...")
    delay(1000L) // 挂起点
    println("数据处理完成")
    return "处理结果"
}

fun main() = runBlocking {
    val data = fetchData()
    val result = processData()
    println("最终结果: $data + $result")
}
```

#### 协程 vs 线程 vs Future/Promise

| 特性 | 协程 | 线程 | Future/Promise |
|------|------|------|----------------|
| 资源开销 | 极低 (~1KB) | 高 (~1MB) | 依赖底层实现 |
| 切换成本 | 几乎为零 | 系统调用 | 异步回调开销 |
| 编程模型 | 顺序代码 | 回调/阻塞 | 回调式 |
| 并发能力 | 高效 | 受限 | 依赖线程池 |

**协程优势示例：**
```kotlin
// 传统的 Future/Promise 风格
fun traditionalAsyncStyle() {
    CompletableFuture.supplyAsync { /* task1 */ }
        .thenCompose { result1 -> 
            CompletableFuture.supplyAsync { /* task2 with result1 */ }
        }
        .thenAccept { result2 ->
            println("Final result: $result2")
        }
}

// 协程风格 - 更直观
suspend fun coroutineStyle() {
    val result1 = async { /* task1 */ }.await()
    val result2 = async { /* task2 with result1 */ }.await()
    println("Final result: $result2")
}
```

### 2. 基本用法

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    // 1. launch - 启动协程，不返回结果
    val job = launch {
        delay(1000L)
        println("Hello from launch!")
    }
    
    // 2. async - 获取结果，返回 Deferred<T>
    val deferred = async {
        delay(2000L)
        "Hello from async!"
    }
    
    // 3. runBlocking - 阻塞调用，等待所有子协程完成
    println("Before delay")
    delay(500L)
    println("After delay")
    
    // 等待 async 完成并获取结果
    println(deferred.await())
}
```

### 3. 挂起函数 (suspend functions)

#### suspend 关键字的作用
`suspend` 关键字标识一个函数可以被挂起和恢复。挂起函数只能在协程内部或其他挂起函数中调用。

```kotlin
// 挂起函数定义
suspend fun fetchUser(userId: String): User {
    delay(1000L) // 这里会挂起，但不阻塞线程
    return User(userId, "User Name")
}

// 挂起函数只能在协程或另一个挂起函数中调用
suspend fun processUser(userId: String) {
    val user = fetchUser(userId) // 正确调用
    println("Processing user: ${user.name}")
}

// 普通函数不能直接调用挂起函数
fun normalFunction() {
    // fetchUser("123") // 编译错误！
    runBlocking {
        val user = fetchUser("123") // 在协程中调用
    }
}

data class User(val id: String, val name: String)
```

#### 挂起函数的限制和特性
```kotlin
class MyClass {
    // 挂起函数不能是构造函数的一部分
    // suspend constructor() {} // 编译错误
    
    suspend fun mySuspendFunction() {
        // 挂起函数可以访问 this
        println("Accessing instance in suspend function")
        
        // 可以调用其他挂起函数
        delay(100L)
        
        // 可以包含普通的同步代码
        val result = calculateSomething()
    }
    
    private fun calculateSomething(): Int {
        return 42
    }
}

// 挂起函数可以作为高阶函数参数
suspend fun executeWithDelay(action: suspend () -> Unit) {
    delay(1000L)
    action()
}

// 挂起函数可以用作 lambda 表达式
val suspendLambda: suspend () -> String = {
    delay(500L)
    "Result from suspend lambda"
}
```

#### 挂起函数链式调用
```kotlin
suspend fun step1(): String {
    delay(100L)
    println("Step 1 completed")
    return "step1_result"
}

suspend fun step2(input: String): String {
    delay(200L)
    println("Step 2 completed with input: $input")
    return "$input_step2"
}

suspend fun step3(input: String): String {
    delay(300L)
    println("Step 3 completed with input: $input")
    return "$input_step3"
}

suspend fun chainExample() {
    val result = step1()
        .let { step2(it) }
        .let { step3(it) }
    println("Chain result: $result")
}

// 使用协程进行链式调用
fun main() = runBlocking {
    chainExample()
}
```

### 4. 协程构建器

#### `launch` - 启动协程，不返回结果
```kotlin
import kotlinx.coroutines.*

fun launchExamples() = runBlocking {
    // 基本用法
    val job1 = launch {
        delay(1000L)
        println("Task 1 completed")
    }
    
    // 带上下文的 launch
    val job2 = launch(Dispatchers.IO) {
        // 在 IO 线程执行
        println("Running on ${Thread.currentThread().name}")
        delay(500L)
    }
    
    // 异常处理的 launch
    val job3 = launch {
        try {
            delay(200L)
            throw RuntimeException("Error in launch")
        } catch (e: Exception) {
            println("Caught exception: ${e.message}")
        }
    }
    
    // 等待所有任务完成
    joinAll(job1, job2, job3)
    println("All launches completed")
}
```

#### `async` - 异步计算，返回 Deferred
```kotlin
import kotlinx.coroutines.*

fun asyncExamples() = runBlocking {
    // 基本用法
    val deferred1 = async {
        delay(1000L)
        "Result 1"
    }
    
    val deferred2 = async {
        delay(500L)
        "Result 2"
    }
    
    // 并发执行，然后获取结果
    val result1 = deferred1.await()
    val result2 = deferred2.await()
    println("Results: $result1, $result2")
    
    // 立即启动的 async (LAZY 模式)
    val lazyDeferred = async(start = CoroutineStart.LAZY) {
        println("Lazy computation started")
        delay(300L)
        "Lazy result"
    }
    
    println("Before await")
    val lazyResult = lazyDeferred.await() // 此时才开始执行
    println("Lazy result: $lazyResult")
    
    // 错误传播示例
    val errorDeferred = async {
        delay(100L)
        throw RuntimeException("Async error")
    }
    
    try {
        errorDeferred.await()
    } catch (e: Exception) {
        println("Caught async error: ${e.message}")
    }
}
```

#### `runBlocking` - 阻塞当前线程直到完成
```kotlin
import kotlinx.coroutines.*

fun runBlockingExamples() {
    // 最简单的用法
    runBlocking {
        delay(1000L)
        println("Inside runBlocking")
    }
    
    // 返回值
    val result = runBlocking {
        delay(500L)
        "Hello from runBlocking"
    }
    println("Result: $result")
    
    // 与现有协程集成
    runBlocking {
        launch {
            delay(200L)
            println("Background task")
        }
        
        delay(1000L)
        println("Main task")
    }
    
    // 使用指定的上下文
    runBlocking(Dispatchers.IO) {
        println("Running on IO dispatcher: ${Thread.currentThread().name}")
    }
}
```

## 协程与通道介绍

### 1. 协程的基本概念

#### 并发执行的工作单元
```kotlin
import kotlinx.coroutines.*

fun concurrentExecution() = runBlocking {
    val startTime = System.currentTimeMillis()
    
    // 多个协程并发执行
    val jobs = List(10) { i ->
        launch {
            delay((i + 1) * 100L) // 不同的延迟时间
            println("Coroutine $i finished at ${System.currentTimeMillis() - startTime}ms")
        }
    }
    
    // 等待所有协程完成
    jobs.joinAll()
    println("All coroutines finished at ${System.currentTimeMillis() - startTime}ms")
}

// 结构化并发示例
suspend fun structuredConcurrency() {
    coroutineScope {
        // 所有子协程都在这个作用域内
        launch {
            delay(1000L)
            println("Child 1 completed")
        }
        
        launch {
            delay(500L)
            println("Child 2 completed")
        }
        
        // 当所有子协程完成后，这个作用域才会结束
    }
    println("Parent scope completed")
}
```

#### 非阻塞异步编程模型
```kotlin
// 传统的阻塞方式
fun blockingWay() {
    val start = System.currentTimeMillis()
    
    // 这些操作会依次执行，总耗时约 3 秒
    Thread.sleep(1000) // 模拟 I/O 操作
    Thread.sleep(1000) // 模拟另一个 I/O 操作
    Thread.sleep(1000) // 模拟第三个 I/O 操作
    
    println("Blocking way took: ${System.currentTimeMillis() - start}ms")
}

// 协程的非阻塞方式
suspend fun nonBlockingWay() {
    val start = System.currentTimeMillis()
    
    // 这些操作并发执行，总耗时约 1 秒
    coroutineScope {
        launch { delay(1000L); println("Task 1 done") }
        launch { delay(1000L); println("Task 2 done") }
        launch { delay(1000L); println("Task 3 done") }
    }
    
    println("Non-blocking way took: ${System.currentTimeMillis() - start}ms")
}

fun main() = runBlocking {
    println("=== Blocking Way ===")
    blockingWay()
    
    println("\n=== Non-blocking Way ===")
    nonBlockingWay()
}
```

### 2. 通道 (Channels) 概述

#### 生产者-消费者模式
```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun producerConsumerExample() = runBlocking {
    // 创建一个通道
    val channel = Channel<String>()
    
    // 生产者协程
    launch {
        for (i in 1..5) {
            val message = "Message $i"
            channel.send(message)
            println("Sent: $message")
            delay(200L)
        }
        channel.close() // 关闭通道表示没有更多数据
    }
    
    // 消费者协程
    launch {
        for (message in channel) { // 循环直到通道关闭
            println("Received: $message")
            delay(100L) // 模拟处理时间
        }
        println("Channel closed, consumer finished")
    }
    
    delay(2000L) // 等待所有操作完成
}
```

#### 协程间通信机制
```kotlin
// 通过通道进行协程间通信
suspend fun interCoroutineCommunication() {
    val requestChannel = Channel<String>()
    val responseChannel = Channel<String>()
    
    // 服务协程
    launch {
        for (request in requestChannel) {
            println("Processing request: $request")
            delay(500L) // 模拟处理时间
            val response = "Response to: $request"
            responseChannel.send(response)
        }
    }
    
    // 客户端协程
    launch {
        requestChannel.send("Request 1")
        val response1 = responseChannel.receive()
        println("Got response: $response1")
        
        requestChannel.send("Request 2")
        val response2 = responseChannel.receive()
        println("Got response: $response2")
        
        requestChannel.close()
    }
}
```

#### 与传统队列的区别
```kotlin
import java.util.concurrent.ConcurrentLinkedQueue
import kotlinx.coroutines.*

// 传统队列方式（阻塞）
fun traditionalQueueExample() {
    val queue = ConcurrentLinkedQueue<String>()
    var hasData = false
    
    thread {
        // 生产者
        repeat(3) { i ->
            queue.offer("Item $i")
            hasData = true
            Thread.sleep(1000)
        }
    }
    
    thread {
        // 消费者 - 忙等待
        while (true) {
            if (hasData && queue.isNotEmpty()) {
                val item = queue.poll()
                if (item != null) {
                    println("Consumed: $item")
                    hasData = queue.isNotEmpty()
                }
            }
            Thread.sleep(10) // 避免过度消耗 CPU
        }
    }
}

// 通道方式（挂起）
suspend fun channelVsQueueExample() {
    val channel = Channel<String>(Channel.BUFFERED)
    
    // 生产者
    launch {
        repeat(3) { i ->
            channel.send("Item $i")
            delay(1000L)
        }
        channel.close()
    }
    
    // 消费者 - 自动挂起等待
    launch {
        for (item in channel) {
            println("Consumed: $item")
        }
    }
    
    delay(5000L)
}
```

## 取消与超时

### 1. 协程取消

#### 主动取消机制
```kotlin
import kotlinx.coroutines.*

fun activeCancellation() = runBlocking {
    val job = launch {
        repeat(1000) { i ->
            println("Job is running: $i")
            delay(500L)
        }
    }
    
    delay(2000L) // 等待 2 秒
    println("About to cancel job")
    job.cancel() // 主动取消
    job.join()   // 等待取消完成
    println("Job was cancelled and joined")
}

// 可取消的长时间运行任务
suspend fun cancellableLongRunningTask() {
    var nextPrintTime = 0L
    var counter = 0
    
    while (isActive) { // 检查协程是否处于活跃状态
        if (System.currentTimeMillis() >= nextPrintTime) {
            println("Count: $counter")
            nextPrintTime += 1000
            counter++
        }
        // yield() 让出执行权，同时检查取消状态
        yield()
    }
    println("Cancellable task was cancelled")
}
```

#### `cancel()` 和 `join()`
```kotlin
fun cancelAndJoinExample() = runBlocking {
    val job = launch {
        try {
            repeat(1000) { i ->
                println("Working $i ...")
                delay(500L)
            }
        } catch (e: CancellationException) {
            println("Coroutine was cancelled")
            throw e // 重新抛出取消异常
        }
    }
    
    delay(1300L) // 等待一段时间
    println("Cancelling job...")
    job.cancel() // 发送取消请求
    
    println("Joining job...")
    job.join() // 等待协程真正结束
    println("Job joined")
}

// 取消和超时结合使用
suspend fun cancellationWithTimeout() {
    withTimeout(1300L) {
        val job = launch {
            try {
                repeat(1000) {
                    println("Background job: $it")
                    delay(500L)
                }
            } finally {
                println("Finally block in background job")
            }
        }
        delay(2000L) // 这会导致超时
    }
}
```

#### 可取消性检查 (`yield()`, `isActive`)
```kotlin
suspend fun cancellationCheckExample() {
    // 方式1: 使用 isActive 检查
    for (i in 1..100) {
        if (!isActive) {
            println("Coroutine was cancelled")
            return
        }
        println("Processing item $i")
        delay(100L)
    }
    
    // 方式2: 使用 yield() 让出执行权并检查取消状态
    repeat(100) { i ->
        println("Yielding $i")
        yield() // 检查取消状态并可能挂起
        println("After yield $i")
    }
}

// 在密集计算中检查取消状态
suspend fun intensiveComputationWithCancellation() {
    var sum = 0L
    for (i in 1L..1000_000_000L) {
        sum += i
        if (i % 10_000_000 == 0L) {
            yield() // 定期检查取消状态
            println("Progress: ${i / 10_000_000}%")
        }
    }
    println("Sum: $sum")
}
```

#### 不可取消的代码块 (`nonCancellable`)
```kotlin
import kotlinx.coroutines.NonCancellable

fun nonCancellableExample() = runBlocking {
    val job = launch {
        try {
            repeat(100) { i ->
                println("Outer loop $i")
                delay(100L)
                
                // 不可取消的代码块
                withContext(NonCancellable) {
                    println("Starting critical section...")
                    delay(500L) // 即使被取消也会完成
                    println("Critical section completed")
                }
            }
        } finally {
            println("Finally in main coroutine")
        }
    }
    
    delay(300L)
    println("Cancelling job...")
    job.cancel()
    delay(700L) // 等待不可取消部分完成
    println("Done")
}
```

### 2. 超时处理

#### `withTimeout` - 超时抛出异常
```kotlin
import kotlinx.coroutines.*

suspend fun withTimeoutExample() {
    try {
        withTimeout(1000L) {
            println("Starting slow operation")
            delay(1500L) // 这会超时
            println("This won't be printed")
        }
    } catch (e: TimeoutCancellationException) {
        println("Operation timed out: ${e.message}")
    }
}

// 嵌套超时
suspend fun nestedTimeoutExample() {
    withTimeout(2000L) {
        println("Outer timeout: 2 seconds")
        
        withTimeout(500L) {
            println("Inner timeout: 500ms")
            delay(1000L) // 这会在 500ms 后超时
        }
    }
}
```

#### `withTimeoutOrNull` - 超时返回 null
```kotlin
suspend fun withTimeoutOrNullExample() {
    // 成功的情况
    val result1 = withTimeoutOrNull(1000L) {
        delay(500L)
        "Success result"
    }
    println("Result 1: $result1") // 输出: Success result
    
    // 超时的情况
    val result2 = withTimeoutOrNull(500L) {
        delay(1000L) // 这会超时
        "This won't be returned"
    }
    println("Result 2: $result2") // 输出: null
}

// 实际应用：网络请求超时
suspend fun networkCallWithTimeout(): String? {
    return withTimeoutOrNull(3000L) { // 3秒超时
        // 模拟网络请求
        delay(2000L)
        "Network response"
    }
}
```

#### 超时与取消的关系
```kotlin
suspend fun timeoutAndCancellationRelationship() {
    val job = launch {
        try {
            withTimeout(1000L) {
                delay(2000L) // 会发生超时
            }
        } catch (e: TimeoutCancellationException) {
            println("Caught timeout exception")
            // 超时会自动取消协程
            println("Is active after timeout: ${isActive}") // false
        }
    }
    
    delay(500L)
    println("Before job cancellation")
    job.cancel() // 尝试再次取消（实际上已经被超时取消了）
    job.join()
}
```

### 3. 取消费户端模式

#### 结构化并发下的取消传播
```kotlin
suspend fun structuredCancellationPropagation() {
    coroutineScope {
        val outerJob = launch {
            println("Outer job started")
            
            val innerJob = launch {
                try {
                    delay(5000L)
                    println("Inner job completed")
                } finally {
                    println("Inner job cleanup")
                }
            }
            
            delay(2000L)
            println("Outer job cancelling")
            // 当外层作用域结束时，所有子协程都会被取消
        }
        
        delay(1000L)
        println("Coroutine scope ending")
    }
    println("All jobs cancelled")
}

// SupervisorScope 的取消隔离
suspend fun supervisorScopeExample() {
    supervisorScope {
        val failingJob = launch {
            delay(100L)
            throw RuntimeException("Failed job")
        }
        
        val workingJob = launch {
            repeat(5) { i ->
                delay(200L)
                println("Working job: $i")
            }
        }
        
        failingJob.join()
        workingJob.join()
    }
}
```

#### 作用域取消的影响
```kotlin
suspend fun scopeCancellationImpact() {
    // regular scope - 取消传播
    println("=== Regular Scope ===")
    try {
        coroutineScope {
            launch {
                delay(100L)
                println("Should not print - will be cancelled")
            }
            
            launch {
                delay(2000L)
                println("This will also be cancelled")
            }
            
            delay(500L)
            throw RuntimeException("Scope failure")
        }
    } catch (e: Exception) {
        println("Scope failed: ${e.message}")
    }
    
    // supervisor scope - 取消隔离
    println("\n=== Supervisor Scope ===")
    supervisorScope {
        val failingJob = launch {
            delay(100L)
            throw RuntimeException("Failing job")
        }
        
        val workingJob = launch {
            delay(500L)
            println("Working job completed successfully")
        }
        
        failingJob.join()
        workingJob.join()
    }
}
```

## 组合挂起函数

### 1. 并发执行

#### `async` 实现并发
```kotlin
import kotlinx.coroutines.*

// 串行 vs 并行获取数据
suspend fun serialDataFetching() {
    val time = measureTimeMillis {
        val user = fetchUserData("user1")
        val posts = fetchUserPosts("user1")
        val comments = fetchUserComments("user1")
        
        println("Serial - User: ${user.name}, Posts: ${posts.size}, Comments: ${comments.size}")
    }
    println("Serial fetching took: ${time}ms")
}

suspend fun parallelDataFetching() {
    val time = measureTimeMillis {
        // 并发启动所有请求
        val userDeferred = async { fetchUserData("user1") }
        val postsDeferred = async { fetchUserPosts("user1") }
        val commentsDeferred = async { fetchUserComments("user1") }
        
        // 等待所有请求完成
        val user = userDeferred.await()
        val posts = postsDeferred.await()
        val comments = commentsDeferred.await()
        
        println("Parallel - User: ${user.name}, Posts: ${posts.size}, Comments: ${comments.size}")
    }
    println("Parallel fetching took: ${time}ms")
}

// 模拟数据获取函数
suspend fun fetchUserData(userId: String): User {
    delay(500L)
    return User(userId, "User $userId")
}

suspend fun fetchUserPosts(userId: String): List<String> {
    delay(800L)
    return listOf("Post 1", "Post 2", "Post 3")
}

suspend fun fetchUserComments(userId: String): List<String> {
    delay(300L)
    return listOf("Comment 1", "Comment 2")
}
```

#### 结构化并发原则
```kotlin
suspend fun structuredConcurrencyPrinciple() {
    // 正确的方式：使用结构化并发
    val results = coroutineScope {
        val deferred1 = async { heavyComputation1() }
        val deferred2 = async { heavyComputation2() }
        val deferred3 = async { heavyComputation3() }
        
        // 所有计算完成后才返回结果
        listOf(
            deferred1.await(),
            deferred2.await(),
            deferred3.await()
        )
    }
    
    println("Structured results: $results")
}

suspend fun heavyComputation1(): String {
    delay(1000L)
    return "Result 1"
}

suspend fun heavyComputation2(): String {
    delay(800L)
    return "Result 2"
}

suspend fun heavyComputation3(): String {
    delay(1200L)
    return "Result 3"
}
```

#### 异常传播与处理
```kotlin
suspend fun exceptionHandlingInConcurrentExecution() {
    try {
        coroutineScope {
            val successJob = async {
                delay(100L)
                "Success result"
            }
            
            val failureJob = async {
                delay(200L)
                throw RuntimeException("Async failure")
            }
            
            val anotherJob = async {
                delay(300L)
                "Another result" // 这个永远不会执行，因为前面的会先失败
            }
            
            // 当任何一个 async 失败时，整个 coroutineScope 会被取消
            listOf(successJob.await(), failureJob.await(), anotherJob.await())
        }
    } catch (e: Exception) {
        println("Caught exception: ${e.message}")
    }
}

// 使用 supervisorScope 来隔离异常
suspend fun supervisorScopeForExceptionIsolation() {
    supervisorScope {
        val successJob = async {
            delay(100L)
            "Success result"
        }
        
        val failureJob = async {
            delay(200L)
            throw RuntimeException("Async failure - isolated")
        }
        
        val anotherJob = async {
            delay(300L)
            "Another result - will execute"
        }
        
        // 分别处理每个结果
        println("Success: ${successJob.await()}")
        try {
            println("Failure: ${failureJob.await()}")
        } catch (e: Exception) {
            println("Failure caught: ${e.message}")
        }
        println("Another: ${anotherJob.await()}")
    }
}
```

### 2. 顺序执行 vs 并发执行

#### 默认顺序执行特性
```kotlin
suspend fun sequentialExecutionByDefault() {
    val time = measureTimeMillis {
        // 默认是顺序执行的
        val result1 = suspendFunction1()
        val result2 = suspendFunction2()
        val result3 = suspendFunction3()
        
        println("Sequential results: $result1, $result2, $result3")
    }
    println("Sequential execution took: ${time}ms")
}

// 并发执行实现
suspend fun concurrentExecutionImplementation() {
    val time = measureTimeMillis {
        // 使用 async 实现并发
        val deferred1 = async { suspendFunction1() }
        val deferred2 = async { suspendFunction2() }
        val deferred3 = async { suspendFunction3() }
        
        val result1 = deferred1.await()
        val result2 = deferred2.await()
        val result3 = deferred3.await()
        
        println("Concurrent results: $result1, $result2, $result3")
    }
    println("Concurrent execution took: ${time}ms")
}

// 模拟挂起函数
suspend fun suspendFunction1(): String {
    delay(1000L)
    return "Result 1"
}

suspend fun suspendFunction2(): String {
    delay(800L)
    return "Result 2"
}

suspend fun suspendFunction3(): String {
    delay(1200L)
    return "Result 3"
}
```

#### 性能对比分析
```kotlin
suspend fun performanceComparison() {
    println("=== Performance Comparison ===")
    
    // 顺序执行
    val sequentialTime = measureTimeMillis {
        val r1 = expensiveOperation(1)
        val r2 = expensiveOperation(2)
        val r3 = expensiveOperation(3)
        val r4 = expensiveOperation(4)
    }
    
    // 并发执行
    val concurrentTime = measureTimeMillis {
        coroutineScope {
            val d1 = async { expensiveOperation(1) }
            val d2 = async { expensiveOperation(2) }
            val d3 = async { expensiveOperation(3) }
            val d4 = async { expensiveOperation(4) }
            
            d1.await(); d2.await(); d3.await(); d4.await()
        }
    }
    
    println("Sequential time: ${sequentialTime}ms")
    println("Concurrent time: ${concurrentTime}ms")
    println("Speedup: ${sequentialTime.toDouble() / concurrentTime}x")
}

suspend fun expensiveOperation(id: Int): String {
    delay(500L) // 模拟耗时操作
    return "Op$id result"
}
```

### 3. 组合策略

#### `awaitAll()` 批量等待
```kotlin
suspend fun awaitAllExample() {
    val deferredList = listOf(
        async { delay(1000L); "First" },
        async { delay(500L); "Second" },
        async { delay(1500L); "Third" },
        async { delay(800L); "Fourth" }
    )
    
    // 批量等待所有异步操作完成
    val results = awaitAll(*deferredList.toTypedArray())
    println("All results: $results")
}

// 在实际场景中的应用
suspend fun batchProcessingExample() {
    val userIds = listOf("1", "2", "3", "4", "5")
    
    val userFetches = userIds.map { userId ->
        async { fetchUserDetails(userId) }
    }
    
    val users = awaitAll(*userFetches.toTypedArray())
    println("Fetched ${users.size} users")
}

suspend fun fetchUserDetails(userId: String): User {
    delay(200L)
    return User(userId, "User $userId")
}
```

#### 选择表达式 (`select` - 实验性)
```kotlin
// 注意：select 是实验性的，在新版本中可能有变化
import kotlinx.coroutines.selects.*

suspend fun selectExample() {
    val channel1 = Channel<String>()
    val channel2 = Channel<String>()
    
    launch {
        delay(1000L)
        channel1.send("From channel 1")
    }
    
    launch {
        delay(500L)
        channel2.send("From channel 2")
    }
    
    // 选择最先可用的操作
    val result = select<String> {
        channel1.onReceive { value ->
            "Received from channel1: $value"
        }
        channel2.onReceive { value ->
            "Received from channel2: $value"
        }
    }
    
    println(result) // 会收到 channel2 的值，因为它先准备好
}
```

#### 错误处理组合
```kotlin
suspend fun combinedErrorHandling() {
    try {
        coroutineScope {
            val jobs = List(5) { i ->
                async {
                    if (i == 2) {
                        throw RuntimeException("Error in job $i")
                    }
                    delay(i * 200L)
                    "Result from job $i"
                }
            }
            
            // 所有任务要么都成功，要么都失败
            val results = awaitAll(*jobs.toTypedArray())
            println("All results: $results")
        }
    } catch (e: Exception) {
        println("Combined error: ${e.message}")
    }
}

// 带重试的组合
suspend fun retryOnErrorCombination() {
    val results = mutableListOf<String>()
    
    coroutineScope {
        repeat(3) { attempt ->
            try {
                val job = async {
                    if (attempt < 2) {
                        throw RuntimeException("Attempt $attempt failed")
                    }
                    "Success on attempt $attempt"
                }
                results.add(job.await())
                return@coroutineScope
            } catch (e: Exception) {
                println("Attempt $attempt failed: ${e.message}")
                if (attempt == 2) throw e // 最后一次尝试也失败
            }
        }
    }
    
    println("Final results: $results")
}
```

## 协程上下文与调度器

### 1. 协程上下文 (CoroutineContext)

#### 上下文元素组成
```kotlin
import kotlinx.coroutines.*

// 协程上下文包含多个元素
fun contextElementsExample() = runBlocking {
    launch {
        // 获取当前协程的上下文信息
        println("Coroutine Context:")
        println("- Job: ${coroutineContext[Job]}")
        println("- Dispatcher: ${coroutineContext[CoroutineDispatcher]}")
        println("- Name: ${coroutineContext[CoroutineName]}")
        println("- Exception Handler: ${coroutineContext[CoroutineExceptionHandler]}")
    }
}

// 自定义上下文元素
class CustomContextElement : AbstractCoroutineContextElement(CustomContextElement) {
    companion object Key : CoroutineContext.Key<CustomContextElement>
    
    override fun toString(): String = "CustomContextElement"
}

suspend fun customContextElementUsage() {
    withContext(CustomContextElement()) {
        println("Custom element in context: ${coroutineContext[CustomContextElement]}")
    }
}
```

#### `+` 操作符合并上下文
```kotlin
suspend fun contextMergingExample() {
    // 创建不同的上下文
    val dispatcherContext = Dispatchers.IO
    val nameContext = CoroutineName("MyCoroutine")
    val customContext = CustomContextElement()
    
    // 使用 + 操作符合并上下文
    val combinedContext = dispatcherContext + nameContext + customContext
    
    withContext(combinedContext) {
        println("Running with merged context")
        println("Name: ${coroutineContext[CoroutineName]?.name}")
        println("Custom: ${coroutineContext[CustomContextElement]}")
    }
}

// 上下文覆盖规则
suspend fun contextOverrideRules() {
    val ctx1 = Dispatchers.Default + CoroutineName("First")
    val ctx2 = Dispatchers.IO + CoroutineName("Second")
    
    // 第二个上下文会覆盖第一个相同类型的元素
    val merged = ctx1 + ctx2
    
    withContext(merged) {
        println("Dispatcher: ${coroutineContext[CoroutineDispatcher]}") // IO
        println("Name: ${coroutineContext[CoroutineName]?.name}") // Second
    }
}
```

#### 上下文继承机制
```kotlin
suspend fun contextInheritance() {
    withContext(CoroutineName("Parent")) {
        println("Parent context: ${coroutineContext[CoroutineName]?.name}")
        
        // 子协程会继承父协程的上下文
        launch {
            println("Child context: ${coroutineContext[CoroutineName]?.name}")
        }
        
        // 但也可以添加新的上下文元素
        launch(CoroutineName("Child")) {
            println("Overridden child: ${coroutineContext[CoroutineName]?.name}")
        }
    }
}

// 上下文在挂起函数间的传递
suspend fun contextPassingBetweenFunctions() {
    withContext(CoroutineName("Initial")) {
        println("In main: ${coroutineContext[CoroutineName]?.name}")
        callSuspendFunction()
    }
}

suspend fun callSuspendFunction() {
    println("In suspend function: ${coroutineContext[CoroutineName]?.name}")
    anotherSuspendFunction()
}

suspend fun anotherSuspendFunction() {
    println("In another function: ${coroutineContext[CoroutineName]?.name}")
}
```

### 2. 调度器 (Dispatchers)

#### `Dispatchers.Main` - UI 线程
```kotlin
// 注意：在 JVM 环境中需要相应的 UI 框架支持
suspend fun mainDispatcherExample() {
    // 在 Android 或 JavaFX 应用中使用
    withContext(Dispatchers.Main) {
        // 更新 UI 组件
        println("Running on Main thread: ${Thread.currentThread().name}")
        // updateUIComponent()
    }
}

// 模拟 Main 调度器（在测试环境中）
suspend fun simulateMainDispatcher() {
    withContext(SupervisorJob() + Dispatchers.Default.limitedParallelism(1)) {
        println("Simulated main thread: ${Thread.currentThread().name}")
    }
}
```

#### `Dispatchers.IO` - IO 密集型
```kotlin
suspend fun ioDispatcherExample() {
    withContext(Dispatchers.IO) {
        println("IO dispatcher thread: ${Thread.currentThread().name}")
        
        // 适合文件读写、网络请求等 IO 操作
        performIoOperation()
    }
}

suspend fun performIoOperation() {
    // 模拟 IO 操作
    delay(100L)
    println("IO operation completed")
}

// IO 调度器的并发能力
suspend fun ioConcurrencyExample() {
    val time = measureTimeMillis {
        coroutineScope {
            repeat(10) { i ->
                async(Dispatchers.IO) {
                    println("IO task $i starting on ${Thread.currentThread().name}")
                    delay(500L) // 模拟 IO 操作
                    println("IO task $i completed")
                }
            }
        }
    }
    println("IO concurrency took: ${time}ms")
}
```

#### `Dispatchers.Default` - CPU 密集型
```kotlin
suspend fun defaultDispatcherExample() {
    withContext(Dispatchers.Default) {
        println("Default dispatcher thread: ${Thread.currentThread().name}")
        
        // 适合 CPU 密集型计算
        val result = cpuIntensiveCalculation()
        println("CPU calculation result: $result")
    }
}

suspend fun cpuIntensiveCalculation(): Long {
    var sum = 0L
    for (i in 1L..100_000_000L) {
        sum += i
    }
    return sum
}

// Default 调度器的并行计算
suspend fun parallelCalculationExample() {
    val time = measureTimeMillis {
        val result = coroutineScope {
            val part1 = async(Dispatchers.Default) { calculateRange(1L, 25_000_000L) }
            val part2 = async(Dispatchers.Default) { calculateRange(25_000_001L, 50_000_000L) }
            val part3 = async(Dispatchers.Default) { calculateRange(50_000_001L, 75_000_000L) }
            val part4 = async(Dispatchers.Default) { calculateRange(75_000_001L, 100_000_000L) }
            
            part1.await() + part2.await() + part3.await() + part4.await()
        }
        println("Parallel calculation result: $result")
    }
    println("Parallel calculation took: ${time}ms")
}

suspend fun calculateRange(start: Long, end: Long): Long {
    var sum = 0L
    for (i in start..end) {
        sum += i
    }
    return sum
}
```

#### `Dispatchers.Unconfined` - 非受限调度器
```kotlin
suspend fun unconfinedDispatcherExample() {
    println("Before Unconfined - ${Thread.currentThread().name}")
    
    withContext(Dispatchers.Unconfined) {
        println("Unconfined 1 - ${Thread.currentThread().name}")
        delay(100L) // 在 delay 后可能会切换到不同的线程
        println("Unconfined 2 - ${Thread.currentThread().name}")
    }
    
    println("After Unconfined - ${Thread.currentThread().name}")
}

// Unconfined 的使用场景
suspend fun unconfinedUseCase() {
    // 适合快速的非阻塞操作
    withContext(Dispatchers.Unconfined) {
        // 快速的状态更新
        updateStateQuickly()
    }
}

suspend fun updateStateQuickly() {
    // 非阻塞的快速操作
    println("State updated quickly")
}
```

### 3. 上下文控制

#### `withContext` 切换上下文
```kotlin
suspend fun contextSwitchingExample() {
    println("Original context: ${Thread.currentThread().name}")
    
    // 切换到 IO 调度器进行文件操作
    val fileContent = withContext(Dispatchers.IO) {
        println("IO context: ${Thread.currentThread().name}")
        readFileContent()
    }
    
    // 切换到 Default 调度器进行计算
    val processedContent = withContext(Dispatchers.Default) {
        println("Default context: ${Thread.currentThread().name}")
        processFileContent(fileContent)
    }
    
    // 返回原始上下文
    println("Back to original: ${Thread.currentThread().name}")
    println("Final result: $processedContent")
}

suspend fun readFileContent(): String {
    delay(200L) // 模拟文件读取
    return "File content"
}

suspend fun processFileContent(content: String): String {
    delay(300L) // 模拟内容处理
    return "Processed: $content"
}
```

#### 自定义调度器
```kotlin
import java.util.concurrent.Executors

// 创建自定义调度器
val customDispatcher = Executors.newFixedThreadPool(4) { runnable ->
    Thread(runnable, "CustomPoolThread").apply { isDaemon = true }
}.asCoroutineDispatcher()

suspend fun customDispatcherUsage() {
    withContext(customDispatcher) {
        println("Running on custom dispatcher: ${Thread.currentThread().name}")
        delay(100L)
    }
    
    // 使用完后记得关闭
    customDispatcher.close()
}

// 限制并发数的调度器
suspend fun limitedConcurrencyDispatcher() {
    val limitedDispatcher = Dispatchers.Default.limitedParallelism(2)
    
    withContext(limitedDispatcher) {
        coroutineScope {
            repeat(5) { i ->
                launch {
                    println("Task $i running on: ${Thread.currentThread().name}")
                    delay(500L)
                }
            }
        }
    }
}
```

#### 上下文隔离
```kotlin
suspend fun contextIsolationExample() {
    withContext(CoroutineName("Outer")) {
        println("Outer context: ${coroutineContext[CoroutineName]?.name}")
        
        // 创建隔离的上下文
        withContext(Job()) {
            println("Isolated context: ${coroutineContext[CoroutineName]?.name}") // null
            println("Still has Job: ${coroutineContext[Job] != null}")
        }
        
        println("Back to outer: ${coroutineContext[CoroutineName]?.name}")
    }
}
```

### 4. Job 与作用域管理

#### Job 的生命周期
```kotlin
import kotlinx.coroutines.*

fun jobLifecycleExample() = runBlocking {
    val job = launch {
        repeat(1000) { i ->
            println("Job is running: $i")
            delay(500L)
        }
    }
    
    delay(1500L)
    println("Job state before cancel: ${job.state}")
    println("Job isActive: ${job.isActive}")
    println("Job isCompleted: ${job.isCompleted}")
    println("Job isCancelled: ${job.isCancelled}")
    
    job.cancel()
    delay(100L)
    println("Job state after cancel: ${job.state}")
    println("Job isCompleted: ${job.isCompleted}")
    println("Job isCancelled: ${job.isCancelled}")
    
    job.join()
    println("Job joined, final state: ${job.state}")
}
```

#### 父子关系与结构化并发
```kotlin
suspend fun parentChildRelationship() {
    val parentJob = Job()
    
    // 子 Job 会继承父 Job 的取消状态
    val childJob = launch(parentJob + CoroutineName("Child")) {
        try {
            repeat(1000) { i ->
                println("Child job running: $i")
                delay(500L)
            }
        } finally {
            println("Child job cleanup")
        }
    }
    
    delay(1500L)
    println("Cancelling parent job")
    parentJob.cancel() // 取消父 Job 会影响子 Job
    
    childJob.join()
    println("Child job finished after parent cancellation")
}

// 作用域构建器
suspend fun scopeBuildersExample() {
    // coroutineScope - 结构化并发
    try {
        coroutineScope {
            launch {
                delay(100L)
                throw RuntimeException("Scope failure")
            }
            delay(1000L) // 这个不会执行，因为上面会抛出异常
        }
    } catch (e: Exception) {
        println("Caught in coroutineScope: ${e.message}")
    }
    
    // supervisorScope - 异常隔离
    supervisorScope {
        val failingJob = launch {
            delay(100L)
            throw RuntimeException("Supervisor child failure")
        }
        
        val workingJob = launch {
            delay(200L)
            println("Working job completed in supervisor scope")
        }
        
        failingJob.join()
        workingJob.join()
    }
}
```

## 异步流 (Flow)

### 1. Flow 基础

#### 响应式流式数据处理
```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// Flow 的基本概念
suspend fun flowBasicsExample() {
    // 创建一个简单的 Flow
    val numbersFlow = flow {
        emit(1)
        emit(2)
        emit(3)
        emit(4)
        emit(5)
    }
    
    // 收集 Flow 中的数据
    numbersFlow.collect { number ->
        println("Collected: $number")
    }
}

// Flow 与序列的对比
suspend fun flowVsSequence() {
    println("=== Flow (Cold Stream) ===")
    val flow = flow {
        println("Flow started")
        emit(1)
        delay(100L)
        emit(2)
        delay(100L)
        emit(3)
    }
    
    println("Flow created, but not started yet")
    delay(200L)
    println("Collecting flow first time:")
    flow.collect { println("First collection: $it") }
    
    println("Collecting flow second time:")
    flow.collect { println("Second collection: $it") }
    
    println("\n=== Sequence (Eager Evaluation) ===")
    val sequence = sequence {
        println("Sequence started")
        yield(1)
        println("After 1")
        yield(2)
        println("After 2")
        yield(3)
        println("After 3")
    }
    
    println("Sequence created")
    println("Iterating sequence first time:")
    sequence.forEach { println("First iteration: $it") }
}
```

#### 冷流特性
```kotlin
// 冷流特性：每次收集都是重新执行
suspend fun coldFlowCharacteristics() {
    val coldFlow = flow {
        println("Flow body executed")
        repeat(3) { i ->
            delay(100L)
            emit("Item $i")
        }
    }
    
    println("Flow created, collecting first time:")
    coldFlow.collect { println("First collection: $it") }
    
    println("\nCollecting second time:")
    coldFlow.collect { println("Second collection: $it") }
}

// 热流 vs 冷流对比
suspend fun hotVsColdFlow() {
    // 冷流 - 每次收集都重新开始
    val coldFlow = flow {
        var counter = 0
        while (true) {
            delay(500L)
            emit(counter++)
        }
    }
    
    // 如果我们想创建热流，需要使用其他机制
    val sharedFlow = MutableSharedFlow<Int>()
    
    // 启动生产者
    launch {
        var counter = 0
        while (true) {
            delay(500L)
            sharedFlow.emit(counter++)
        }
    }
    
    // 两个收集者会收到相同的值（热流）
    launch {
        delay(1000L)
        println("First collector starting")
        sharedFlow.take(5).collect { println("Collector 1: $it") }
    }
    
    launch {
        delay(2000L)
        println("Second collector starting")
        sharedFlow.take(5).collect { println("Collector 2: $it") }
    }
    
    delay(5000L)
}
```

#### Flow vs Sequence vs Observable
```kotlin
// Flow 的优势展示
suspend fun flowAdvantages() {
    // 1. 异步操作
    val asyncFlow = flow {
        repeat(3) { i ->
            delay(1000L) // 异步操作
            emit("Async item $i")
        }
    }
    
    // 2. 背压处理
    val fastFlow = flow {
        repeat(10) { i ->
            emit(i)
        }
    }
    
    fastFlow
        .buffer(2) // 缓冲区大小为2
        .collect { value ->
            delay(300L) // 模拟慢速处理
            println("Collected: $value")
        }
    
    // 3. 错误处理
    val errorHandlingFlow = flow {
        emit(1)
        emit(2)
        throw RuntimeException("Flow error")
        emit(3) // 这个不会发出
    }
    
    try {
        errorHandlingFlow.catch { e ->
            println("Caught error: ${e.message}")
            emit(-1) // 发送错误标记
        }.collect { println("Value: $it") }
    } catch (e: Exception) {
        println("Unhandled error: ${e.message}")
    }
}
```

### 2. Flow 构建

#### `flow { }` 构建器
```kotlin
// 基本的 flow 构建器
suspend fun basicFlowBuilder() {
    val simpleFlow = flow {
        emit("Hello")
        delay(1000L)
        emit("World")
        delay(1000L)
        emit("!")
    }
    
    simpleFlow.collect { println("Basic flow: $it") }
}

// 复杂的 flow 构建器示例
suspend fun complexFlowBuilder() {
    val complexFlow = flow {
        emit("Starting...")
        
        // 模拟多个步骤
        val step1 = async { performStep(1) }
        val step2 = async { performStep(2) }
        val step3 = async { performStep(3) }
        
        emit(step1.await())
        emit(step2.await())
        emit(step3.await())
        
        emit("Completed!")
    }
    
    complexFlow.collect { println("Complex flow: $it") }
}

suspend fun performStep(step: Int): String {
    delay((step * 500).toLong())
    return "Step $step completed"
}
```

#### `flowOf()` 创建简单流
```kotlin
suspend fun flowOfExample() {
    // 创建包含固定值的 Flow
    val simpleFlow = flowOf(1, 2, 3, 4, 5)
    simpleFlow.collect { println("flowOf: $it") }
    
    // 与列表转换
    val listFlow = listOf(10, 20, 30).asFlow()
    listFlow.collect { println("List as flow: $it") }
    
    // 字符串流
    val stringFlow = flowOf("A", "B", "C", "D")
    stringFlow.collect { println("String flow: $it") }
}
```

#### `asFlow()` 转换集合
```kotlin
suspend fun asFlowConversion() {
    // 转换各种集合类型
    val listFlow = listOf(1, 2, 3, 4, 5).asFlow()
    val setFlow = setOf("apple", "banana", "cherry").asFlow()
    val arrayFlow = arrayOf("one", "two", "three").asFlow()
    
    println("List flow:")
    listFlow.collect { println("  $it") }
    
    println("\nSet flow:")
    setFlow.collect { println("  $it") }
    
    println("\nArray flow:")
    arrayFlow.collect { println("  $it") }
}

// Range 转换为 Flow
suspend fun rangeToFlow() {
    (1..5).asFlow()
        .collect { println("Range item: $it") }
    
    // 步长为2的范围
    (0..10 step 2).asFlow()
        .collect { println("Stepped range: $it") }
}
```

### 3. Flow 操作符

#### 中间操作符 (transformations)
```kotlin
suspend fun intermediateOperators() {
    val sourceFlow = (1..10).asFlow()
    
    // map - 转换每个元素
    sourceFlow
        .map { it * 2 }
        .collect { println("Mapped: $it") }
    
    println("\n--- filter ---")
    // filter - 过滤元素
    sourceFlow
        .filter { it % 2 == 0 }
        .collect { println("Filtered: $it") }
    
    println("\n--- take ---")
    // take - 取前几个元素
    sourceFlow
        .take(3)
        .collect { println("Take: $it") }
    
    println("\n--- drop ---")
    // drop - 跳过前几个元素
    sourceFlow
        .drop(7)
        .collect { println("Drop: $it") }
    
    println("\n--- distinct ---")
    // distinct - 去重
    flowOf(1, 1, 2, 2, 3, 3)
        .distinctUntilChanged()
        .collect { println("Distinct: $it") }
    
    println("\n--- transform ---")
    // transform - 通用转换操作符
    sourceFlow
        .transform { value ->
            emit("Before: $value")
            if (value > 5) {
                emit("Large number: $value")
            }
            emit("After: $value")
        }
        .collect { println("Transform: $it") }
}
```

#### 终端操作符 (collections)
```kotlin
suspend fun terminalOperators() {
    val numbersFlow = (1..10).asFlow()
    
    // collect - 收集所有元素
    println("Collect all:")
    numbersFlow.collect { print("$it ") }
    println()
    
    // toList - 转换为列表
    val list = numbersFlow.toList()
    println("To list: $list")
    
    // toSet - 转换为集合
    val set = numbersFlow.filter { it % 2 == 0 }.toSet()
    println("To set: $set")
    
    // reduce - 归约操作
    val sum = numbersFlow.reduce { acc, value -> acc + value }
    println("Sum: $sum")
    
    // fold - 带初始值的归约
    val product = numbersFlow.fold(1) { acc, value -> acc * value }
    println("Product: $product")
    
    // first, last, single
    val first = numbersFlow.first()
    val last = numbersFlow.last()
    println("First: $first, Last: $last")
    
    // count
    val evenCount = numbersFlow.count { it % 2 == 0 }
    println("Even count: $evenCount")
    
    // any, all
    val hasOdd = numbersFlow.any { it % 2 == 1 }
    val allLessThan20 = numbersFlow.all { it < 20 }
    println("Has odd: $hasOdd, All less than 20: $allLessThan20")
}
```

#### 错误处理操作符
```kotlin
suspend fun errorHandlingOperators() {
    // catch - 捕获上游错误
    flowOf(1, 2, 3)
        .map { value ->
            if (value == 2) throw RuntimeException("Error at $value")
            value * 2
        }
        .catch { e ->
            println("Caught error: ${e.message}")
            emit(-1) // 发送错误标记
        }
        .collect { println("Value: $it") }
    
    println("\n--- retry ---")
    // retry - 重试操作
    var attempt = 0
    flow {
        attempt++
        println("Attempt: $attempt")
        if (attempt < 3) {
            throw RuntimeException("Retryable error")
        }
        emit("Success on attempt $attempt")
    }
    .retry(5) { cause ->
        println("Retrying due to: ${cause.message}")
        true
    }
    .collect { println("Final result: $it") }
    
    println("\n--- retryWhen ---")
    // retryWhen - 条件重试
    var retryCount = 0
    flowOf(1, 2, 3)
        .map { value ->
            if (value == 2) throw RuntimeException("Error at $value")
            value
        }
        .retryWhen { cause, attempt ->
            if (attempt < 3 && cause.message?.contains("Error") == true) {
                println("Retrying... (attempt $attempt)")
                delay(100L)
                retryCount++
                true
            } else {
                false
            }
        }
        .catch { e -> println("Final error: ${e.message}") }
        .collect { println("Value: $it") }
}
```

### 4. Flow 配置

#### 背压处理
```kotlin
suspend fun backpressureHandling() {
    // buffer - 缓冲背压
    println("=== Buffer Example ===")
    flow {
        repeat(5) { i ->
            println("Emitting $i")
            emit(i)
            delay(100L)
        }
    }
    .buffer(3) // 缓冲区大小为3
    .collect { value ->
        println("Collecting $value")
        delay(200L) // 模拟慢速处理
    }
    
    println("\n=== Conflate Example ===")
    // conflate - 合并背压（只保留最新值）
    flow {
        repeat(10) { i ->
            emit(i)
            delay(50L)
        }
    }
    .conflate() // 只处理最新的值
    .collect { value ->
        delay(100L) // 模拟慢速处理
        println("Conflated value: $value")
    }
    
    println("\n=== CollectLatest Example ===")
    // collectLatest - 只收集最新的值
    flow {
        repeat(5) { i ->
            emit(i)
            delay(100L)
        }
    }
    .collectLatest { value ->
        println("Started collecting $value")
        delay(300L) // 模拟慢速处理
        println("Finished collecting $value")
    }
}
```

#### 缓冲与收集
```kotlin
suspend fun bufferingAndCollection() {
    val source = flow {
        repeat(8) { i ->
            println("Source emitting $i")
            emit(i)
            delay(100L)
        }
    }
    
    println("=== No buffering ===")
    source.collect { value ->
        println("Collecting $value")
        delay(200L) // 慢速处理
    }
    
    println("\n=== With buffer ===")
    source.buffer(5).collect { value ->
        println("Buffered collecting $value")
        delay(200L) // 慢速处理
    }
    
    println("\n=== With produceIn ===")
    // produceIn - 将 Flow 转换为 Channel
    val channel = source.produceIn(this)
    repeat(8) {
        val value = channel.receive()
        println("Produced: $value")
        delay(150L)
    }
}
```

#### 调度器切换
```kotlin
suspend fun dispatcherSwitchingInFlow() {
    flowOf(1, 2, 3, 4, 5)
        .flowOn(Dispatchers.IO) // 在 IO 线程上发射
        .map { value ->
            println("Mapping on: ${Thread.currentThread().name}, value: $value")
            value * 2
        }
        .flowOn(Dispatchers.Default) // 在 Default 线程上映射
        .collect { value ->
            println("Collecting on: ${Thread.currentThread().name}, value: $value")
        }
}

// Flow 中的上下文控制
suspend fun flowContextControl() {
    flow {
        repeat(3) { i ->
            emit("Item $i")
            delay(200L)
        }
    }
    .flowOn(Dispatchers.IO) // 发射在 IO 线程
    .map { item ->
        withContext(Dispatchers.Default) { // 处理在 Default 线程
            println("Processing $item on ${Thread.currentThread().name}")
            item.uppercase()
        }
    }
    .collect { item ->
        println("Collected $item on ${Thread.currentThread().name}")
    }
}
```

### 5. Flow 特殊操作符

#### `shareIn()` 共享流
```kotlin
import kotlinx.coroutines.flow.SharingStarted

suspend fun shareInExample() {
    // 创建一个热流
    val sharedFlow = flow {
        var counter = 0
        while (true) {
            delay(1000L)
            emit("Shared item ${counter++}")
        }
    }
    .shareIn(
        scope = this,
        started = SharingStarted.WhileSubscribed(0L, 0L) // 订阅时开始，无订阅时停止
    )
    
    // 多个收集者共享同一个流
    launch {
        delay(500L)
        println("First collector starts")
        sharedFlow.take(3).collect { println("Collector 1: $it") }
    }
    
    launch {
        delay(1500L)
        println("Second collector starts")
        sharedFlow.take(3).collect { println("Collector 2: $it") }
    }
    
    delay(5000L)
}
```

#### `stateIn()` 状态流
```kotlin
import kotlinx.coroutines.flow.MutableStateFlow

suspend fun stateInExample() {
    // 创建可变状态流
    val mutableStateFlow = MutableStateFlow("Initial")
    
    // 转换为共享的状态流
    val stateFlow = mutableStateFlow
        .map { it.uppercase() }
        .stateIn(
            scope = this,
            started = SharingStarted.WhileSubscribed(0L),
            initialValue = "Default"
        )
    
    // 收集状态流
    launch {
        stateFlow.collect { value ->
            println("State collected: $value")
        }
    }
    
    // 更新状态
    delay(1000L)
    mutableStateFlow.value = "Updated Value"
    delay(1000L)
    mutableStateFlow.value = "Another Update"
    
    delay(2000L)
}
```

#### `broadcastChannel` (已废弃)
```kotlin
// 注意：BroadcastChannel 已被废弃，推荐使用 SharedFlow
import kotlinx.coroutines.channels.BroadcastChannel
import kotlinx.coroutines.channels.Channel

// 旧版本示例（不推荐使用）
suspend fun broadcastChannelExample() {
    val channel = BroadcastChannel<String>(Channel.BUFFERED)
    
    // 发送者
    launch {
        repeat(3) { i ->
            channel.send("Broadcast $i")
            delay(1000L)
        }
        channel.close()
    }
    
    // 多个接收者
    launch {
        val subscriber = channel.openSubscription()
        repeat(3) {
            val value = subscriber.receive()
            println("Subscriber 1: $value")
        }
    }
    
    launch {
        val subscriber = channel.openSubscription()
        repeat(3) {
            val value = subscriber.receive()
            println("Subscriber 2: $value")
        }
    }
    
    delay(5000L)
}
```

## 通道 (Channels)

### 1. 通道基础

#### 生产者-消费者通信
```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

suspend fun producerConsumerBasic() {
    val channel = Channel<String>()
    
    // 生产者
    launch {
        repeat(5) { i ->
            val message = "Message $i"
            channel.send(message)
            println("Sent: $message")
            delay(200L)
        }
        channel.close() // 关闭通道
    }
    
    // 消费者
    launch {
        for (message in channel) {
            println("Received: $message")
            delay(100L)
        }
        println("Channel closed, consumer finished")
    }
    
    delay(2000L)
}
```

#### 通道容量与缓冲
```kotlin
suspend fun channelCapacityExample() {
    println("=== Rendezvous Channel (capacity = 0) ===")
    val rendezvousChannel = Channel<String>(Channel.RENDEZVOUS)
    
    launch {
        println("Sending to rendezvous channel")
        rendezvousChannel.send("Rendezvous message")
        println("Message sent")
    }
    
    delay(500L)
    launch {
        delay(1000L)
        val msg = rendezvousChannel.receive()
        println("Received: $msg")
    }
    
    delay(2000L)
    
    println("\n=== Buffered Channel ===")
    val bufferedChannel = Channel<String>(Channel.BUFFERED)
    
    launch {
        repeat(5) {
            bufferedChannel.send("Buffered $it")
            println("Buffered sent: $it")
        }
    }
    
    launch {
        repeat(5) {
            delay(300L)
            val msg = bufferedChannel.receive()
            println("Buffered received: $msg")
        }
    }
    
    delay(2000L)
}

// 自定义容量通道
suspend fun customCapacityChannel() {
    val channel = Channel<String>(3) // 容量为3
    
    launch {
        repeat(5) { i ->
            println("About to send $i")
            channel.send("Item $i") // 前3个立即发送，第4个会挂起
            println("Sent $i")
        }
        channel.close()
    }
    
    launch {
        delay(1000L)
        for (item in channel) {
            println("Received: $item")
            delay(500L) // 慢速消费
        }
    }
    
    delay(3000L)
}
```

#### 通道关闭与完整性
```kotlin
suspend fun channelClosingExample() {
    val channel = Channel<Int>()
    
    launch {
        try {
            repeat(3) { i ->
                channel.send(i)
                println("Sent: $i")
            }
        } finally {
            println("Closing channel")
            channel.close()
        }
    }
    
    launch {
        try {
            for (item in channel) {
                println("Received: $item")
            }
        } finally {
            println("Channel iteration completed")
        }
    }
    
    delay(1000L)
}

// 带异常的通道关闭
suspend fun channelWithErrorClosing() {
    val channel = Channel<String>()
    
    launch {
        try {
            repeat(3) { i ->
                channel.send("Item $i")
            }
            throw RuntimeException("Error in sender")
        } catch (e: Exception) {
            channel.close(e) // 关闭并传递异常
        }
    }
    
    launch {
        try {
            for (item in channel) {
                println("Received: $item")
            }
        } catch (e: Exception) {
            println("Caught in receiver: ${e.message}")
        }
    }
    
    delay(1000L)
}
```

### 2. 通道类型

#### 无缓冲通道
```kotlin
suspend fun rendezvousChannelExample() {
    val channel = Channel<String>(Channel.RENDEZVOUS)
    
    launch {
        println("Sender: About to send")
        channel.send("Synchronous message") // 必须等待接收者
        println("Sender: Message sent")
    }
    
    launch {
        delay(1000L) // 延迟接收
        println("Receiver: About to receive")
        val msg = channel.receive()
        println("Receiver: Received: $msg")
    }
    
    delay(2000L)
}
```

#### 有缓冲通道
```kotlin
suspend fun bufferedChannelTypes() {
    // 默认缓冲
    val defaultBuffered = Channel<String>(Channel.BUFFERED)
    
    // 无缓冲
    val unbuffered = Channel<String>(Channel.RENDEZVOUS)
    
    // 有限缓冲
    val limitedBuffered = Channel<String>(2)
    
    // 演示不同缓冲类型的行为
    println("=== Limited Buffered Channel ===")
    val channel = Channel<String>(2)
    
    launch {
        repeat(5) { i ->
            println("Sending $i...")
            channel.send("Item $i")
            println("Sent $i")
        }
        channel.close()
    }
    
    launch {
        delay(1000L)
        for (item in channel) {
            println("Received: $item")
            delay(300L)
        }
    }
    
    delay(3000L)
}
```

#### BroadcastChannel (已废弃)
```kotlin
// 旧版本的广播通道示例
suspend fun broadcastChannelUsage() {
    val broadcastChannel = BroadcastChannel<String>(Channel.BUFFERED)
    
    // 发送者
    launch {
        repeat(3) { i ->
            broadcastChannel.send("Broadcast $i")
            delay(500L)
        }
        broadcastChannel.close()
    }
    
    // 多个订阅者
    repeat(2) { subscriberId ->
        launch {
            val subscription = broadcastChannel.openSubscription()
            for (item in subscription) {
                println("Subscriber $subscriberId received: $item")
            }
        }
    }
    
    delay(2000L)
}
```

### 3. 通道操作

#### 发送 (`send`, `offer`)
```kotlin
suspend fun channelSendOperations() {
    val channel = Channel<String>(1)
    
    // send - 阻塞发送
    launch {
        channel.send("Blocking send")
        println("Blocking send completed")
    }
    
    // offer - 非阻塞发送
    launch {
        delay(200L)
        val offered = channel.offer("Non-blocking send")
        println("Offer result: $offered")
        
        // 尝试发送到满的通道
        val fullResult = channel.offer("Won't fit")
        println("Full channel offer: $fullResult")
    }
    
    launch {
        delay(500L)
        println("Received: ${channel.receive()}")
    }
    
    delay(1000L)
}
```

#### 接收 (`receive`, `tryReceive`)
```kotlin
suspend fun channelReceiveOperations() {
    val channel = Channel<String>(Channel.BUFFERED)
    
    // 发送一些数据
    launch {
        repeat(3) { i ->
            channel.send("Item $i")
            delay(200L)
        }
    }
    
    launch {
        // receive - 阻塞接收
        val item1 = channel.receive()
        println("Received: $item1")
        
        // tryReceive - 非阻塞接收
        try {
            val item2 = channel.tryReceive().getOrNull()
            println("Try receive: $item2")
            
            // 尝试从空通道接收
            val emptyResult = channel.tryReceive().getOrNull()
            println("Empty channel: $emptyResult")
        } catch (e: Exception) {
            println("Try receive error: ${e.message}")
        }
    }
    
    delay(1000L)
}
```

#### 迭代通道内容
```kotlin
suspend fun iterateChannelContent() {
    val channel = Channel<Int>(Channel.BUFFERED)
    
    // 生产者
    launch {
        repeat(5) { i ->
            channel.send(i)
            delay(100L)
        }
        channel.close()
    }
    
    // 方式1: for 循环
    println("=== For Loop Iteration ===")
    launch {
        for (item in channel) {
            println("For loop: $item")
        }
    }
    
    delay(1000L)
    
    // 方式2: 接收直到关闭
    val channel2 = Channel<String>(Channel.BUFFERED)
    
    launch {
        repeat(3) { i ->
            channel2.send("Msg $i")
            delay(100L)
        }
        channel2.close()
    }
    
    launch {
        while (!channel2.isClosedForReceive) {
            val result = channel2.tryReceive()
            if (result.isSuccess) {
                println("While loop: ${result.getOrNull()}")
            } else {
                delay(50L) // 等待新数据
            }
        }
    }
    
    delay(1000L)
}
```

### 4. 通道管道

#### 数据处理管道
```kotlin
suspend fun dataProcessingPipeline() {
    // 输入通道
    val inputChannel = Channel<Int>(Channel.BUFFERED)
    
    // 处理通道
    val processingChannel = Channel<String>(Channel.BUFFERED)
    
    // 输出通道
    val outputChannel = Channel<String>(Channel.BUFFERED)
    
    // 数据生产者
    launch {
        repeat(5) { i ->
            inputChannel.send(i)
            delay(100L)
        }
        inputChannel.close()
    }
    
    // 数据处理器
    launch {
        for (number in inputChannel) {
            val processed = "Processed: ${number * 2}"
            processingChannel.send(processed)
        }
        processingChannel.close()
    }
    
    // 数据输出器
    launch {
        for (processed in processingChannel) {
            val formatted = "Formatted: [$processed]"
            outputChannel.send(formatted)
        }
        outputChannel.close()
    }
    
    // 最终消费者
    launch {
        for (output in outputChannel) {
            println("Final output: $output")
        }
    }
    
    delay(1000L)
}
```

#### 扇入扇出模式
```kotlin
// 扇出 (Fan-out) - 一个输入多个处理者
suspend fun fanOutPattern() {
    val inputChannel = Channel<Int>(Channel.BUFFERED)
    
    // 启动多个处理器
    repeat(3) { processorId ->
        launch {
            for (item in inputChannel) {
                delay(100L) // 模拟处理时间
                println("Processor $processorId handling: $item")
            }
        }
    }
    
    // 生产数据
    launch {
        repeat(6) { i ->
            inputChannel.send(i)
            delay(50L)
        }
        inputChannel.close()
    }
    
    delay(1000L)
}

// 扇入 (Fan-in) - 多个输入一个汇聚点
suspend fun fanInPattern() {
    val outputChannel = Channel<String>(Channel.BUFFERED)
    
    // 多个生产者
    repeat(3) { producerId ->
        launch {
            repeat(2) { i ->
                val message = "Producer $producerId - Item $i"
                outputChannel.send(message)
                delay(100L)
            }
        }
    }
    
    // 单一消费者
    launch {
        repeat(6) { // 期望接收6个消息
            val message = outputChannel.receive()
            println("Consumer received: $message")
        }
    }
    
    delay(1000L)
}
```

#### 通道与协程结合使用
```kotlin
suspend fun channelsWithCoroutinesIntegration() {
    // 创建一个服务通道
    val serviceChannel = Channel<ServiceRequest>(Channel.BUFFERED)
    
    // 服务协程
    launch {
        for (request in serviceChannel) {
            when (request.type) {
                RequestType.GET_USER -> {
                    val user = getUser(request.id)
                    request.responseChannel.send(ServiceResponse.Success(user))
                }
                RequestType.CREATE_USER -> {
                    val user = createUser(request.data)
                    request.responseChannel.send(ServiceResponse.Success(user))
                }
            }
        }
    }
    
    // 客户端协程
    launch {
        // 发送获取用户请求
        val responseChannel = Channel<ServiceResponse>(Channel.RENDEZVOUS)
        serviceChannel.send(ServiceRequest(RequestType.GET_USER, "123", "", responseChannel))
        val response = responseChannel.receive()
        println("Get user response: $response")
        
        // 发送创建用户请求
        val createResponseChannel = Channel<ServiceResponse>(Channel.RENDEZVOUS)
        serviceChannel.send(ServiceRequest(RequestType.CREATE_USER, "", "New User", createResponseChannel))
        val createResponse = createResponseChannel.receive()
        println("Create user response: $createResponse")
    }
    
    delay(1000L)
}

// 辅助类
enum class RequestType { GET_USER, CREATE_USER }

data class ServiceRequest(
    val type: RequestType,
    val id: String,
    val data: String,
    val responseChannel: Channel<ServiceResponse>
)

sealed class ServiceResponse {
    data class Success(val data: Any) : ServiceResponse()
    data class Error(val message: String) : ServiceResponse()
}

suspend fun getUser(id: String): String {
    delay(200L)
    return "User: $id"
}

suspend fun createUser(data: String): String {
    delay(300L)
    return "Created user: $data"
}
```

## 协程异常处理

### 1. 异常传播

#### 结构化并发下的异常传播
```kotlin
suspend fun structuredExceptionPropagation() {
    try {
        coroutineScope {
            launch {
                delay(100L)
                throw RuntimeException("Child exception")
            }
            
            launch {
                delay(500L)
                println("This should not print") // 不会执行
            }
            
            delay(1000L)
            println("This should also not print") // 不会执行
        }
    } catch (e: Exception) {
        println("Caught in parent: ${e.message}")
    }
}

// 异常传播的详细过程
suspend fun detailedExceptionPropagation() {
    println("=== Starting coroutineScope ===")
    
    try {
        coroutineScope {
            println("Inside coroutineScope")
            
            launch {
                println("Child 1 starting")
                delay(200L)
                println("Child 1 about to fail")
                throw RuntimeException("Child 1 failed")
            }
            
            launch {
                println("Child 2 starting")
                delay(100L)
                println("Child 2 doing work...")
                delay(500L) // 这个不会完成，因为子协程会失败
                println("Child 2 completed") // 不会执行
            }
            
            delay(1000L) // 主作用域不会等到这里，因为子协程失败了
            println("Main scope completed") // 不会执行
        }
    } catch (e: Exception) {
        println("Exception caught: ${e.message}")
        println("Exception in: ${e.stackTrace.firstOrNull()?.methodName}")
    }
    
    println("After coroutineScope - should continue")
}
```

#### SupervisorJob 与异常隔离
```kotlin
suspend fun supervisorJobExceptionIsolation() {
    supervisorScope {
        val failingJob = launch {
            delay(100L)
            println("Failing job starting")
            throw RuntimeException("Supervised failure")
        }
        
        val workingJob = launch {
            repeat(5) { i ->
                delay(200L)
                println("Working job: $i")
            }
        }
        
        failingJob.join()
        workingJob.join()
        println("Both jobs completed (failing one with exception)")
    }
}

// SupervisorJob 详细示例
suspend fun detailedSupervisorJob() {
    val supervisorJob = SupervisorJob()
    
    try {
        withContext(supervisorJob) {
            val job1 = launch {
                delay(100L)
                throw RuntimeException("Job 1 fails")
            }
            
            val job2 = launch {
                delay(200L)
                println("Job 2 succeeds despite job 1 failure")
                delay(200L)
                println("Job 2 completes")
            }
            
            val job3 = launch {
                delay(300L)
                println("Job 3 also succeeds")
            }
            
            joinAll(job1, job2, job3)
        }
    } finally {
        supervisorJob.cancel()
    }
}
```

#### 异常聚合处理
```kotlin
suspend fun exceptionAggregation() {
    try {
        coroutineScope {
            val jobs = List(3) { i ->
                async {
                    delay((i + 1) * 100L)
                    if (i == 1) {
                        throw RuntimeException("Error in job $i")
                    }
                    "Result from job $i"
                }
            }
            
            // 这里会抛出异常，聚合所有子协程的异常
            val results = awaitAll(*jobs.toTypedArray())
            println("Results: $results")
        }
    } catch (e: Exception) {
        println("Aggregated exception: ${e.message}")
        e.printStackTrace()
    }
}

// 处理多个异常
suspend fun multipleExceptionsHandling() {
    val exceptions = mutableListOf<Throwable>()
    
    supervisorScope {
        val jobs = List(3) { i ->
            async {
                delay((i + 1) * 100L)
                if (i in 1..2) {
                    throw RuntimeException("Error in job $i")
                }
                "Success from job $i"
            }
        }
        
        jobs.forEach { job ->
            try {
                job.await()
            } catch (e: Exception) {
                exceptions.add(e)
            }
        }
    }
    
    println("Collected exceptions: ${exceptions.size}")
    exceptions.forEachIndexed { index, exception ->
        println("Exception $index: ${exception.message}")
    }
}
```

### 2. 异常处理策略

#### `try-catch` 在协程中使用
```kotlin
suspend fun tryCatchInCoroutines() {
    // 在协程内部处理异常
    launch {
        try {
            delay(100L)
            throw RuntimeException("Internal error")
        } catch (e: Exception) {
            println("Caught inside coroutine: ${e.message}")
        }
    }
    
    // 在协程外部处理异常
    try {
        async {
            delay(200L)
            throw RuntimeException("Async error")
        }.await()
    } catch (e: Exception) {
        println("Caught outside coroutine: ${e.message}")
    }
    
    delay(500L)
}

// 嵌套异常处理
suspend fun nestedExceptionHandling() {
    coroutineScope {
        launch {
            try {
                async {
                    try {
                        delay(100L)
                        throw RuntimeException("Deep error")
                    } catch (e: Exception) {
                        println("Caught deep: ${e.message}")
                        throw RuntimeException("Re-thrown error", e)
                    }
                }.await()
            } catch (e: Exception) {
                println("Caught outer: ${e.message}")
                if (e.cause != null) {
                    println("Caused by: ${e.cause!!.message}")
                }
            }
        }
    }
}
```

#### `SupervisorScope` 异常隔离
```kotlin
suspend fun supervisorScopeIsolation() {
    supervisorScope {
        // 这个失败不会影响其他协程
        launch {
            delay(100L)
            throw RuntimeException("Supervised failure")
        }
        
        // 这个会正常运行
        launch {
            delay(200L)
            println("This runs despite other failure")
        }
        
        // 这个也会正常运行
        launch {
            delay(300L)
            println("This also runs normally")
        }
    }
}

// SupervisorScope 与 async 的结合
suspend fun supervisorScopeWithAsync() {
    val results = supervisorScope {
        val failingDeferred = async {
            delay(100L)
            throw RuntimeException("Async failure")
        }
        
        val successfulDeferred = async {
            delay(200L)
            "Successful result"
        }
        
        val anotherSuccessful = async {
            delay(300L)
            "Another successful result"
        }
        
        // 分别处理结果
        val results = mutableListOf<String?>()
        
        try {
            results.add(failingDeferred.await())
        } catch (e: Exception) {
            println("Failed async caught: ${e.message}")
            results.add(null)
        }
        
        results.add(successfulDeferred.await())
        results.add(anotherSuccessful.await())
        
        results
    }
    
    println("Results: $results")
}
```

#### `CoroutineExceptionHandler`
```kotlin
// 自定义异常处理器
val customExceptionHandler = CoroutineExceptionHandler { _, exception ->
    println("Custom handler caught: ${exception.message}")
    println("Exception type: ${exception::class.simpleName}")
}

suspend fun coroutineExceptionHandlerUsage() {
    // 在作用域中使用异常处理器
    withContext(customExceptionHandler) {
        launch {
            delay(100L)
            throw RuntimeException("Handled exception")
        }
        
        delay(500L)
        println("Main coroutine continues")
    }
}

// 全局异常处理器
class GlobalExceptionHandler : CoroutineExceptionHandler {
    override val key = CoroutineExceptionHandler
    
    override fun handleException(context: CoroutineContext, exception: Throwable) {
        println("Global handler: ${exception.message}")
        // 记录日志、上报错误等
    }
}

suspend fun globalExceptionHandlerExample() {
    val globalHandler = GlobalExceptionHandler()
    
    withContext(globalHandler) {
        async {
            throw RuntimeException("Global handling test")
        }
        
        delay(200L)
    }
}
```

### 3. 异常处理范围

#### `coroutineScope` vs `supervisorScope`
```kotlin
suspend fun compareScopes() {
    println("=== CoroutineScope (fail-fast) ===")
    try {
        coroutineScope {
            launch {
                delay(100L)
                throw RuntimeException("CoroutineScope failure")
            }
            
            launch {
                delay(200L)
                println("This won't execute")
            }
        }
    } catch (e: Exception) {
        println("CoroutineScope caught: ${e.message}")
    }
    
    println("\n=== SupervisorScope (isolation) ===")
    supervisorScope {
        val failingJob = launch {
            delay(100L)
            throw RuntimeException("SupervisorScope failure")
        }
        
        val workingJob = launch {
            delay(200L)
            println("This executes despite failure")
        }
        
        failingJob.join()
        workingJob.join()
    }
}

// 作用域内的异常处理行为
suspend fun scopeSpecificBehavior() {
    // 在 coroutineScope 中，异常会传播
    println("=== CoroutineScope behavior ===")
    try {
        coroutineScope {
            async {
                delay(100L)
                throw RuntimeException("Scope exception")
            }.await()
            
            println("This won't print") // 不会执行
        }
    } catch (e: Exception) {
        println("Caught in coroutineScope: ${e.message}")
    }
    
    // 在 supervisorScope 中，异常被隔离
    println("\n=== SupervisorScope behavior ===")
    supervisorScope {
        val deferred = async {
            delay(100L)
            throw RuntimeException("Supervisor exception")
        }
        
        // 即使 async 失败，作用域也会继续
        delay(200L)
        println("Supervisor scope continues")
        
        try {
            deferred.await()
        } catch (e: Exception) {
            println("Caught specific: ${e.message}")
        }
    }
}
```

#### 子协程异常对父协程的影响
```kotlin
suspend fun parentChildExceptionRelationship() {
    println("=== Parent affected by child ===")
    try {
        coroutineScope {
            // 父协程
            launch {
                println("Parent started")
                
                // 子协程失败
                launch {
                    delay(100L)
                    throw RuntimeException("Child failure")
                }
                
                // 父协程的后续代码不会执行
                delay(500L)
                println("Parent should not reach here")
            }
        }
    } catch (e: Exception) {
        println("Parent caught: ${e.message}")
    }
    
    println("\n=== Parent unaffected by supervised child ===")
    supervisorScope {
        launch {
            println("Supervised parent started")
            
            launch {
                delay(100L)
                throw RuntimeException("Supervised child failure")
            }
            
            delay(500L)
            println("Supervised parent continues")
        }
    }
}
```

### 4. 异常清理

#### `finally` 块与资源清理
```kotlin
suspend fun finallyBlockCleanup() {
    println("=== Finally block execution ===")
    
    try {
        coroutineScope {
            launch {
                try {
                    delay(100L)
                    throw RuntimeException("Exception in coroutine")
                } finally {
                    println("Finally block executed in coroutine")
                    // 清理资源
                }
            }
        }
    } catch (e: Exception) {
        println("Caught exception: ${e.message}")
    }
    
    println("After exception handling")
}

// 资源管理示例
suspend fun resourceManagementWithFinally() {
    var resource: AutoCloseableResource? = null
    
    try {
        resource = AutoCloseableResource("Test Resource")
        
        coroutineScope {
            launch {
                try {
                    delay(100L)
                    resource.use()
                    delay(200L)
                    throw RuntimeException("Error during resource use")
                } finally {
                    resource?.cleanup()
                }
            }
        }
    } catch (e: Exception) {
        println("Exception handled: ${e.message}")
    } finally {
        resource?.finalCleanup()
    }
}

class AutoCloseableResource(val name: String) {
    var used = false
    
    fun use() {
        used = true
        println("$name is being used")
    }
    
    fun cleanup() {
        if (used) {
            println("$name cleaned up in finally")
        }
    }
    
    fun finalCleanup() {
        println("$name final cleanup")
    }
}
```

#### `ensureActive()` 检查活跃状态
```kotlin
suspend fun ensureActiveExample() {
    val job = launch {
        repeat(1000) { i ->
            ensureActive() // 检查协程是否活跃
            println("Working $i...")
            delay(100L)
        }
    }
    
    delay(500L)
    job.cancel()
    println("Job cancelled, ensureActive will throw CancellationException")
    
    job.join()
}

// 在长时间循环中使用 ensureActive
suspend fun longRunningTaskWithEnsureActive() {
    var counter = 0
    while (true) {
        ensureActive() // 检查是否被取消
        
        // 模拟工作
        delay(10L)
        counter++
        
        if (counter % 100 == 0) {
            println("Processed $counter items")
        }
    }
}
```

#### 协程取消时的清理工作
```kotlin
suspend fun cancellationCleanup() {
    val job = launch {
        try {
            repeat(1000) { i ->
                println("Working: $i")
                delay(100L)
            }
        } finally {
            // 协程被取消时执行清理
            if (!isActive) {
                println("Cleaning up after cancellation")
                performCleanup()
            }
        }
    }
    
    delay(500L)
    job.cancelAndJoin()
    println("Job cancelled and cleaned up")
}

suspend fun performCleanup() {
    delay(100L) // 模拟清理时间
    println("Cleanup completed")
}

// 使用 withContext 进行清理
suspend fun cleanupWithContext() {
    withContext(NonCancellable) {
        try {
            // 可能被取消的操作
            delay(1000L)
        } finally {
            // 不可取消的清理代码
            println("Critical cleanup in NonCancellable context")
        }
    }
}
```

## 共享的可变状态与并发

### 1. 并发问题

#### 竞态条件 (Race Conditions)
```kotlin
// 竞态条件示例
class Counter {
    var count = 0
    
    fun increment() {
        val current = count
        Thread.sleep(1) // 模拟延迟，增加竞态条件概率
        count = current + 1
    }
}

suspend fun raceConditionExample() {
    val counter = Counter()
    val jobs = mutableListOf<Job>()
    
    // 启动多个协程同时修改计数器
    repeat(100) {
        val job = launch {
            repeat(10) {
                counter.increment()
            }
        }
        jobs.add(job)
    }
    
    jobs.joinAll()
    println("Expected: 1000, Actual: ${counter.count}")
    // 结果通常小于 1000，因为存在竞态条件
}

// 使用原子操作修复竞态条件
import java.util.concurrent.atomic.AtomicInteger

class AtomicCounter {
    private val atomicCount = AtomicInteger(0)
    
    fun increment() {
        atomicCount.incrementAndGet()
    }
    
    fun getCount(): Int = atomicCount.get()
}

suspend fun atomicCounterExample() {
    val counter = AtomicCounter()
    val jobs = mutableListOf<Job>()
    
    repeat(100) {
        val job = launch {
            repeat(10) {
                counter.increment()
            }
        }
        jobs.add(job)
    }
    
    jobs.joinAll()
    println("Atomic counter - Expected: 1000, Actual: ${counter.getCount()}")
}
```

#### 数据竞争 (Data Race)
```kotlin
// 数据竞争示例
class UnsafeBankAccount {
    var balance = 1000
    
    suspend fun withdraw(amount: Int) {
        if (balance >= amount) {
            delay(1) // 模拟处理时间
            balance -= amount
        }
    }
    
    suspend fun deposit(amount: Int) {
        if (amount > 0) {
            delay(1) // 模拟处理时间
            balance += amount
        }
    }
    
    fun getBalance(): Int = balance
}

suspend fun dataRaceExample() {
    val account = UnsafeBankAccount()
    val jobs = mutableListOf<Job>()
    
    // 多个协程同时操作账户
    repeat(50) {
        jobs.add(launch { account.withdraw(10) })
        jobs.add(launch { account.deposit(5) })
    }
    
    jobs.joinAll()
    println("Unsafe account balance: ${account.getBalance()}")
    // 由于数据竞争，结果可能不符合预期
}

// 修复数据竞争
class SafeBankAccount {
    private val mutex = Mutex()
    private var balance = 1000
    
    suspend fun withdraw(amount: Int) = mutex.withLock {
        if (balance >= amount) {
            delay(1) // 模拟处理时间
            balance -= amount
        }
    }
    
    suspend fun deposit(amount: Int) = mutex.withLock {
        if (amount > 0) {
            delay(1) // 模拟处理时间
            balance += amount
        }
    }
    
    suspend fun getBalance(): Int = mutex.withLock { balance }
}

suspend fun safeBankAccountExample() {
    val account = SafeBankAccount()
    val jobs = mutableListOf<Job>()
    
    repeat(50) {
        jobs.add(launch { account.withdraw(10) })
        jobs.add(launch { account.deposit(5) })
    }
    
    jobs.joinAll()
    println("Safe account balance: ${account.getBalance()}")
}
```

#### 原子性问题
```kotlin
// 原子性问题示例
class NonAtomicOperations {
    var value1 = 0
    var value2 = 0
    
    suspend fun updateBoth(newValue1: Int, newValue2: Int) {
        value1 = newValue1 // 第一步
        delay(1)          // 模拟中间状态可见
        value2 = newValue2 // 第二步
    }
    
    fun getValues(): Pair<Int, Int> = Pair(value1, value2)
}

suspend fun atomicityProblemExample() {
    val obj = NonAtomicOperations()
    val jobs = mutableListOf<Job>()
    
    // 更新操作
    jobs.add(launch {
        repeat(100) { i ->
            obj.updateBoth(i, i * 2)
        }
    })
    
    // 读取操作
    jobs.add(launch {
        repeat(100) {
            val (v1, v2) = obj.getValues()
            if (v2 != v1 * 2) {
                println("Inconsistent state detected: ($v1, $v2)")
            }
            delay(1)
        }
    })
    
    jobs.joinAll()
}

// 使用锁保证原子性
class AtomicOperations {
    private val mutex = Mutex()
    private var value1 = 0
    private var value2 = 0
    
    suspend fun updateBoth(newValue1: Int, newValue2: Int) = mutex.withLock {
        value1 = newValue1
        value2 = newValue2
    }
    
    suspend fun getValues(): Pair<Int, Int> = mutex.withLock { Pair(value1, value2) }
}
```

### 2. 线程安全解决方案

#### `synchronized` 替代方案
```kotlin
// 传统 synchronized 方式（Java风格）
/*
class SynchronizedCounter {
    @Synchronized
    fun increment() {
        count++
    }
}
*/

// Kotlin 协程中的替代方案：Mutex
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

class MutexBasedCounter {
    private val mutex = Mutex()
    private var count = 0
    
    suspend fun increment() = mutex.withLock {
        val current = count
        delay(1) // 模拟处理
        count = current + 1
    }
    
    suspend fun getCount(): Int = mutex.withLock { count }
}

suspend fun mutexExample() {
    val counter = MutexBasedCounter()
    val jobs = mutableListOf<Job>()
    
    repeat(100) {
        val job = launch {
            repeat(10) {
                counter.increment()
            }
        }
        jobs.add(job)
    }
    
    jobs.joinAll()
    println("Mutex counter: ${counter.getCount()}")
}
```

#### `Mutex` 互斥锁
```kotlin
// Mutex 详细使用示例
class MutexExample {
    private val mutex = Mutex()
    private val data = mutableListOf<Int>()
    
    suspend fun addItem(item: Int) = mutex.withLock {
        println("Adding $item, current size: ${data.size}")
        data.add(item)
        delay(10) // 模拟处理时间
        println("Added $item, new size: ${data.size}")
    }
    
    suspend fun removeItem(): Int? = mutex.withLock {
        if (data.isNotEmpty()) {
            val item = data.removeAt(0)
            println("Removed $item, new size: ${data.size}")
            item
        } else {
            null
        }
    }
    
    suspend fun getSize(): Int = mutex.withLock { data.size }
}

suspend fun mutexDetailedExample() {
    val example = MutexExample()
    val jobs = mutableListOf<Job>()
    
    // 添加任务
    repeat(5) { i ->
        jobs.add(launch {
            example.addItem(i)
        })
    }
    
    // 移除任务
    repeat(3) { 
        jobs.add(launch {
            example.removeItem()
        })
    }
    
    jobs.joinAll()
    println("Final size: ${example.getSize()}")
}
```

#### `Semaphore` 信号量
```kotlin
import kotlinx.coroutines.sync.Semaphore
import kotlinx.coroutines.sync.withPermit

// 使用信号量控制并发数量
class SemaphoreExample {
    private val semaphore = Semaphore(3) // 最多3个并发
    private val activeTasks = mutableListOf<Int>()
    
    suspend fun performTask(taskId: Int) = semaphore.withPermit {
        activeTasks.add(taskId)
        println("Task $taskId started, active: ${activeTasks.joinToString(", ")}")
        
        delay(1000L) // 模拟任务执行
        
        activeTasks.remove(taskId)
        println("Task $taskId completed, active: ${activeTasks.joinToString(", ")}")
    }
}

suspend fun semaphoreExample() {
    val example = SemaphoreExample()
    val jobs = mutableListOf<Job>()
    
    // 启动10个任务，但只有3个能同时运行
    repeat(10) { i ->
        jobs.add(launch {
            example.performTask(i)
        })
    }
    
    jobs.joinAll()
    println("All tasks completed")
}
```

### 3. 原子变量

#### `AtomicReference`
```kotlin
import java.util.concurrent.atomic.AtomicReference

class AtomicReferenceExample {
    private val dataRef = AtomicReference<String>("Initial")
    
    fun updateData(newValue: String): Boolean {
        var current: String
        do {
            current = dataRef.get()
            val expected = current.uppercase()
            if (expected == newValue) {
                // 模拟 CAS 操作的条件
                if (dataRef.compareAndSet(current, newValue)) {
                    return true
                }
            }
        } while (true)
    }
    
    fun getData(): String = dataRef.get()
    
    // 更实际的例子：计数器
    private val counter = AtomicReference(0)
    
    fun incrementCounter(): Int {
        var current: Int
        var next: Int
        do {
            current = counter.get()
            next = current + 1
        } while (!counter.compareAndSet(current, next))
        return next
    }
    
    fun getCounter(): Int = counter.get()
}

suspend fun atomicReferenceExample() {
    val example = AtomicReferenceExample()
    val jobs = mutableListOf<Job>()
    
    repeat(100) {
        jobs.add(launch {
            example.incrementCounter()
        })
    }
    
    jobs.joinAll()
    println("Atomic counter result: ${example.getCounter()}")
}
```

#### `AtomicBoolean`, `AtomicInteger`
```kotlin
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicInteger

class AtomicVariablesExample {
    private val flag = AtomicBoolean(false)
    private val counter = AtomicInteger(0)
    
    fun setFlag(value: Boolean): Boolean = flag.set(value)
    fun getFlag(): Boolean = flag.get()
    
    fun increment(): Int = counter.incrementAndGet()
    fun decrement(): Int = counter.decrementAndGet()
    fun getCounter(): Int = counter.get()
    
    // 原子复合操作
    fun incrementIfNotSet(): Boolean {
        if (!flag.get()) {
            if (flag.compareAndSet(false, true)) {
                counter.incrementAndGet()
                return true
            }
        }
        return false
    }
}

suspend fun atomicVariablesExample() {
    val example = AtomicVariablesExample()
    val jobs = mutableListOf<Job>()
    
    repeat(50) {
        jobs.add(launch {
            example.incrementIfNotSet()
        })
    }
    
    jobs.joinAll()
    println("Final flag: ${example.getFlag()}, counter: ${example.getCounter()}")
}
```

#### 原子操作 vs 锁性能对比
```kotlin
suspend fun performanceComparison() {
    val atomicCounter = AtomicInteger(0)
    val mutex = Mutex()
    var regularCounter = 0
    
    // 原子操作性能测试
    val atomicTime = measureTimeMillis {
        coroutineScope {
            repeat(10) { 
                launch {
                    repeat(1000) {
                        atomicCounter.incrementAndGet()
                    }
                }
            }
        }
    }
    
    // Mutex 性能测试
    val mutexTime = measureTimeMillis {
        coroutineScope {
            repeat(10) {
                launch {
                    repeat(1000) {
                        mutex.withLock {
                            regularCounter++
                        }
                    }
                }
            }
        }
    }
    
    println("Atomic operations time: ${atomicTime}ms")
    println("Mutex operations time: ${mutexTime}ms")
    println("Atomic counter: ${atomicCounter.get()}")
    println("Regular counter: $regularCounter")
}
```

### 4. Actor 模式

#### 封装状态的协程
```kotlin
// Actor 模式实现
sealed class AccountCommand {
    data class Deposit(val amount: Int) : AccountCommand()
    data class Withdraw(val amount: Int) : AccountCommand()
    data class GetBalance(val responseChannel: Channel<Int>) : AccountCommand()
}

class BankAccountActor {
    private val channel = Channel<AccountCommand>()
    
    init {
        // 启动 actor 协程
        launch(Dispatchers.Default) {
            var balance = 1000
            
            for (command in channel) {
                when (command) {
                    is AccountCommand.Deposit -> {
                        if (command.amount > 0) {
                            balance += command.amount
                        }
                    }
                    is AccountCommand.Withdraw -> {
                        if (command.amount > 0 && balance >= command.amount) {
                            balance -= command.amount
                        }
                    }
                    is AccountCommand.GetBalance -> {
                        command.responseChannel.send(balance)
                    }
                }
            }
        }
    }
    
    suspend fun deposit(amount: Int) {
        channel.send(AccountCommand.Deposit(amount))
    }
    
    suspend fun withdraw(amount: Int) {
        channel.send(AccountCommand.Withdraw(amount))
    }
    
    suspend fun getBalance(): Int {
        val responseChannel = Channel<Int>()
        channel.send(AccountCommand.GetBalance(responseChannel))
        return responseChannel.receive()
    }
}

suspend fun actorPatternExample() {
    val account = BankAccountActor()
    
    // 并发操作
    launch {
        repeat(10) {
            account.deposit(100)
            delay(10L)
        }
    }
    
    launch {
        repeat(5) {
            account.withdraw(50)
            delay(15L)
        }
    }
    
    delay(500L)
    println("Final balance: ${account.getBalance()}")
}
```

#### 状态管理最佳实践
```kotlin
// 更复杂的 Actor 示例：订单处理系统
sealed class OrderCommand {
    data class CreateOrder(val orderId: String, val items: List<String>) : OrderCommand()
    data class CancelOrder(val orderId: String) : OrderCommand()
    data class GetOrderStatus(val orderId: String, val responseChannel: Channel<OrderStatus?>) : OrderCommand()
}

enum class OrderStatus { PENDING, CONFIRMED, SHIPPED, CANCELLED }

class OrderProcessingActor {
    private val channel = Channel<OrderCommand>()
    private val orders = mutableMapOf<String, OrderStatus>()
    
    init {
        launch(Dispatchers.Default) {
            for (command in channel) {
                when (command) {
                    is OrderCommand.CreateOrder -> {
                        if (!orders.containsKey(command.orderId)) {
                            orders[command.orderId] = OrderStatus.PENDING
                            println("Created order: ${command.orderId}")
                        }
                    }
                    is OrderCommand.CancelOrder -> {
                        orders[command.orderId]?.let { currentStatus ->
                            if (currentStatus != OrderStatus.SHIPPED) {
                                orders[command.orderId] = OrderStatus.CANCELLED
                                println("Cancelled order: ${command.orderId}")
                            }
                        }
                    }
                    is OrderCommand.GetOrderStatus -> {
                        val status = orders[command.orderId]
                        command.responseChannel.send(status)
                    }
                }
            }
        }
    }
    
    suspend fun createOrder(orderId: String, items: List<String>) {
        channel.send(OrderCommand.CreateOrder(orderId, items))
    }
    
    suspend fun cancelOrder(orderId: String) {
        channel.send(OrderCommand.CancelOrder(orderId))
    }
    
    suspend fun getOrderStatus(orderId: String): OrderStatus? {
        val responseChannel = Channel<OrderStatus?>()
        channel.send(OrderCommand.GetOrderStatus(orderId, responseChannel))
        return responseChannel.receive()
    }
}

suspend fun orderActorExample() {
    val orderActor = OrderProcessingActor()
    
    // 创建订单
    orderActor.createOrder("ORD001", listOf("Item1", "Item2"))
    orderActor.createOrder("ORD002", listOf("Item3"))
    
    delay(100L)
    
    // 查询状态
    println("Order 1 status: ${orderActor.getOrderStatus("ORD001")}")
    println("Order 2 status: ${orderActor.getOrderStatus("ORD002")}")
    
    // 取消订单
    orderActor.cancelOrder("ORD001")
    println("Order 1 after cancellation: ${orderActor.getOrderStatus("ORD001")}")
}
```

#### 与其他并发模式比较
```kotlin
// 对比：共享状态 vs Actor 模式
class SharedStateCounter {
    private val mutex = Mutex()
    private var count = 0
    
    suspend fun increment() = mutex.withLock { count++ }
    suspend fun getCount(): Int = mutex.withLock { count }
}

// Actor 模式的计数器
sealed class CounterCommand {
    object Increment : CounterCommand()
    data class GetCount(val response: CompletableDeferred<Int>) : CounterCommand()
}

class ActorCounter {
    private val channel = Channel<CounterCommand>()
    
    init {
        launch {
            var count = 0
            for (cmd in channel) {
                when (cmd) {
                    is CounterCommand.Increment -> count++
                    is CounterCommand.GetCount -> cmd.response.complete(count)
                }
            }
        }
    }
    
    suspend fun increment() {
        channel.send(CounterCommand.Increment)
    }
    
    suspend fun getCount(): Int {
        val deferred = CompletableDeferred<Int>()
        channel.send(CounterCommand.GetCount(deferred))
        return deferred.await()
    }
}

suspend fun comparisonExample() {
    println("=== Shared State Approach ===")
    val sharedCounter = SharedStateCounter()
    coroutineScope {
        repeat(10) {
            launch { sharedCounter.increment() }
        }
    }
    println("Shared counter: ${sharedCounter.getCount()}")
    
    println("\n=== Actor Pattern Approach ===")
    val actorCounter = ActorCounter()
    coroutineScope {
        repeat(10) {
            launch { actorCounter.increment() }
        }
    }
    println("Actor counter: ${actorCounter.getCount()}")
}
```

### 5. 线程安全的数据结构

#### 线程安全的集合
```kotlin
// 使用 ConcurrentHashMap
import java.util.concurrent.ConcurrentHashMap

class ThreadSafeCollections {
    private val map = ConcurrentHashMap<String, String>()
    private val set = ConcurrentHashMap.newKeySet<String>()
    
    fun put(key: String, value: String) = map.put(key, value)
    fun get(key: String): String? = map[key]
    fun addSetItem(item: String) = set.add(item)
    fun getSetItems(): Set<String> = set.toSet()
}

// 使用协程友好的数据结构
class CoroutinesFriendlyStructures {
    // 使用 Mutex 保护普通集合
    private val mutex = Mutex()
    private val list = mutableListOf<String>()
    
    suspend fun addItem(item: String) = mutex.withLock {
        list.add(item)
    }
    
    suspend fun getItems(): List<String> = mutex.withLock {
        list.toList() // 返回副本
    }
    
    // 使用 Channel 作为队列
    private val queueChannel = Channel<String>(Channel.BUFFERED)
    
    suspend fun enqueue(item: String) {
        queueChannel.send(item)
    }
    
    suspend fun dequeue(): String? {
        return try {
            queueChannel.receive()
        } catch (e: Exception) {
            null
        }
    }
}
```

#### 并发友好的设计模式
```kotlin
// 不可变数据优先
data class ImmutableUser(
    val id: String,
    val name: String,
    val email: String,
    val roles: List<String> = emptyList()
) {
    fun withName(newName: String) = copy(name = newName)
    fun withEmail(newEmail: String) = copy(email = newEmail)
    fun addRole(role: String) = copy(roles = roles + role)
}

// 使用 StateFlow 管理状态
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

class UserManager {
    private val _users = MutableStateFlow<List<ImmutableUser>>(emptyList())
    val users: StateFlow<List<ImmutableUser>> = _users.asStateFlow()
    
    fun addUser(user: ImmutableUser) {
        _users.value = _users.value + user
    }
    
    fun updateUser(updatedUser: ImmutableUser) {
        _users.value = _users.value.map { user ->
            if (user.id == updatedUser.id) updatedUser else user
        }
    }
    
    fun removeUser(userId: String) {
        _users.value = _users.value.filter { it.id != userId }
    }
}

suspend fun immutableDesignExample() {
    val userManager = UserManager()
    
    // 观察用户变化
    launch {
        userManager.users.collect { users ->
            println("Current users: ${users.size}")
        }
    }
    
    // 修改用户
    val user1 = ImmutableUser("1", "Alice", "alice@example.com")
    userManager.addUser(user1)
    
    delay(100L)
    val updatedUser1 = user1.withName("Alice Smith")
    userManager.updateUser(updatedUser1)
    
    delay(100L)
    userManager.removeUser("1")
    
    delay(200L)
}
```

#### 性能考虑因素
```kotlin
suspend fun performanceConsiderations() {
    // 1. 避免过度同步
    class OverSyncExample {
        private val mutex = Mutex()
        private var data = 0
        
        // 不好的做法：读操作也加锁
        suspend fun badGetData(): Int = mutex.withLock { data }
        
        // 好的做法：使用 StateFlow
        private val _state = MutableStateFlow(0)
        val state: StateFlow<Int> = _state.asStateFlow()
        
        suspend fun goodUpdate() {
            _state.value = _state.value + 1
        }
    }
    
    // 2. 减少锁的持有时间
    class ReducedLockTime {
        private val mutex = Mutex()
        private val data = mutableListOf<String>()
        
        // 不好的做法：长时间持有锁
        suspend fun badMethod(items: List<String>) = mutex.withLock {
            // 模拟长时间操作
            delay(1000L)
            data.addAll(items)
        }
        
        // 好的做法：最小化锁持有时间
        suspend fun goodMethod(items: List<String>) {
            val processedItems = processItems(items) // 在锁外处理
            mutex.withLock {
                data.addAll(processedItems)
            }
        }
        
        private suspend fun processItems(items: List<String>): List<String> {
            delay(1000L) // 模拟处理
            return items.map { it.uppercase() }
        }
    }
    
    // 3. 使用无锁数据结构（当适用时）
    class LockFreeStructure {
        private val atomicList = AtomicReference<List<String>>(emptyList())
        
        fun addItem(item: String) {
            var current: List<String>
            var next: List<String>
            do {
                current = atomicList.get()
                next = current + item
            } while (!atomicList.compareAndSet(current, next))
        }
        
        fun getItems(): List<String> = atomicList.get()
    }
}
```

### 6. 实践建议

#### 何时使用共享状态
```kotlin
// 适合使用共享状态的场景
class SuitableForSharedState {
    // 1. 简单的计数器或标志
    private val counter = AtomicInteger(0)
    
    fun increment() = counter.incrementAndGet()
    
    // 2. 缓存（读多写少）
    private val cacheMutex = Mutex()
    private val cache = mutableMapOf<String, String>()
    
    suspend fun getCached(key: String): String? = cacheMutex.withLock {
        cache[key]
    }
    
    suspend fun putCached(key: String, value: String) = cacheMutex.withLock {
        cache[key] = value
    }
    
    // 3. 配置管理（很少修改）
    private val configMutex = Mutex()
    private var config = AppConfiguration()
    
    suspend fun updateConfig(newConfig: AppConfiguration) = configMutex.withLock {
        config = newConfig
    }
    
    suspend fun getConfig(): AppConfiguration = configMutex.withLock {
        config.copy() // 返回副本
    }
}

data class AppConfiguration(
    val timeoutMs: Long = 5000,
    val maxRetries: Int = 3,
    val enabledFeatures: Set<String> = emptySet()
)
```

#### 不可变数据优先原则
```kotlin
// 推荐：不可变数据结构
data class Transaction(
    val id: String,
    val amount: Double,
    val timestamp: Long = System.currentTimeMillis(),
    val status: Status = Status.PENDING
) {
    enum class Status { PENDING, PROCESSING, COMPLETED, FAILED }
    
    fun complete() = copy(status = Status.COMPLETED)
    fun fail() = copy(status = Status.FAILED)
}

// 管理不可变对象的集合
class TransactionManager {
    private val transactions = MutableStateFlow<List<Transaction>>(emptyList())
    
    fun addTransaction(transaction: Transaction) {
        transactions.value = transactions.value + transaction
    }
    
    fun completeTransaction(id: String) {
        transactions.value = transactions.value.map { tx ->
            if (tx.id == id && tx.status == Transaction.Status.PENDING) {
                tx.complete()
            } else {
                tx
            }
        }
    }
    
    fun getTransactions() = transactions.value
}
```

#### 测试并发代码的方法
```kotlin
import kotlinx.coroutines.test.*
import org.junit.Test
import kotlin.test.assertEquals

// 测试并发代码的示例
class ConcurrencyTesting {
    @Test
    fun testConcurrentCounter() = runTest {
        val counter = AtomicCounter()
        
        // 使用 TestScope 进行并发测试
        val jobs = List(10) { 
            async {
                repeat(100) {
                    counter.increment()
                }
            }
        }
        
        jobs.awaitAll()
        assertEquals(1000, counter.getCount())
    }
    
    @Test
    fun testRaceConditionDetection() = runTest {
        val counter = Counter()
        
        // 运行多次来检测竞态条件
        repeat(10) {
            val jobs = List(10) { 
                async {
                    repeat(10) {
                        counter.increment()
                    }
                }
            }
            jobs.awaitAll()
            // 如果存在竞态条件，结果可能不总是 100
            if (counter.count != 100) {
                println("Race condition detected! Count: ${counter.count}")
            }
            counter.count = 0 // 重置用于下次测试
        }
    }
}

// 使用超时来测试死锁
@Test
fun testNoDeadlock() = runTest {
    withTimeout(5000L) { // 5秒超时
        val example = MutexExample()
        
        // 可能导致死锁的操作
        launch {
            example.addItem(1)
        }
        
        launch {
            delay(100L)
            example.removeItem()
        }
        
        delay(1000L) // 等待操作完成
    }
}
```
这是一个为您完善的 Kotlin **注解 (Annotations)** 部分的大纲。考虑到 Kotlin 的特性（如与 Java 的互操作性、编译时处理、反射等），这份大纲从基础语法到高级应用进行了系统化的梳理，适合用于技术文档、教程或内部培训材料。

---