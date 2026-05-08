# 读取标准输入输出 (Standard I/O in Kotlin)

Kotlin 的标准 I/O 设计哲学是：**简洁、安全、互操作性**。它既保留了 Java `System.in/out` 的强大功能，又通过扩展函数和空安全机制极大地简化了日常开发。

## 1. 基础输出 (Output)

### 1.1 `print()` vs `println()`
这是最基础的输出方式，它们实际上是 `kotlin.io` 包中对 `System.out` 的封装。

*   **`println()`**: 输出内容后自动追加一个换行符 (`\n`)。
*   **`print()`**: 仅输出内容，光标停留在末尾。

```kotlin
fun main() {
    println("Hello, World!") // 输出: Hello, World! [换行]
    print("Kotlin ")         // 输出: Kotlin 
    print("is awesome")      // 输出: is awesome
    // 最终控制台显示:
    // Hello, World!
    // Kotlin is awesome
}
```

### 1.2 字符串模板 (String Templates)
这是 Kotlin 相比 Java `+` 拼接或 `String.format` 最大的优势之一，可读性极高。

*   **简单变量插入**: `$variableName`
*   **复杂表达式插入**: `${expression}`
*   **转义**: 如果需要输出 `$` 符号，使用 `\$`。

```kotlin
fun main() {
    val name = "Alice"
    val age = 30
    
    // 简单插入
    println("Name: $name") 
    
    // 复杂表达式：直接在字符串中进行计算或调用方法
    println("Next year, $name will be ${age + 1} years old.")
    println("Name length: ${name.length}")
    
    // 转义美元符号
    val price = 100
    println("The price is \$${price}") // 输出: The price is $100
}
```

### 1.3 格式化输出
虽然字符串模板很强大，但在处理对齐、小数位数保留等场景时，传统格式化依然必要。

*   **`String.format()`**: 沿用 Java/C 风格。
*   **多行字符串与修剪**: 适合输出大块文本（如 SQL、JSON、HTML）。

```kotlin
fun main() {
    // 1. String.format
    val pi = 3.1415926535
    println(String.format("Pi is approximately %.2f", pi)) // 输出: Pi is approximately 3.14
    
    // 2. 多行字符串与 trimIndent
    // trimIndent 会移除每行共同的缩进前缀，使代码排版整齐且输出干净
    val sqlQuery = """
        SELECT id, name, email
        FROM users
        WHERE active = true
        ORDER BY name
    """.trimIndent()
    
    println(sqlQuery)
    /* 输出:
    SELECT id, name, email
    FROM users
    WHERE active = true
    ORDER BY name
    */
}
```

---

## 2. 基础输入 (Input)

### 2.1 `readLine()` 与 `readln()`
这是从控制台读取一行文本的标准方式。

*   **`readLine()`**: 返回 `String?`。如果到达输入流末尾（EOF），返回 `null`。**必须处理空指针风险**。
*   **`readln()`** (Kotlin 1.6+): 返回 `String`。如果到达 EOF，抛出 `NoSuchElementException`。适合脚本或确定有输入的场景，代码更简洁。

```kotlin
fun main() {
    // 方式 A: 使用 readLine (传统，安全)
    print("Enter your name (readLine): ")
    val name1 = readLine()
    if (name1 != null) {
        println("Hello, $name1")
    } else {
        println("No input provided.")
    }

    // 方式 B: 使用 readln (现代，简洁)
    // 注意：如果在 IDE 中运行且没有输入，可能会抛异常，建议配合 try-catch 或确保有输入
    print("Enter your name (readln): ")
    try {
        val name2 = readln()
        println("Hello, $name2")
    } catch (e: NoSuchElementException) {
        println("Input stream ended.")
    }
}
```

### 2.2 `Scanner` 类 (Java 互操作)
当需要直接读取特定类型（如 `Int`, `Double`）而不想手动解析字符串时，可以使用 Java 的 `Scanner`。

*   **优点**: API 丰富，直接获取类型。
*   **缺点**: 性能较差（正则解析），非 Kotlin 原生风格，需要处理 `InputMismatchException`。

```kotlin
import java.util.Scanner

fun main() {
    val scanner = Scanner(System.`in`)
    
    print("Enter an integer: ")
    if (scanner.hasNextInt()) {
        val number = scanner.nextInt()
        println("You entered: $number")
    } else {
        println("Invalid integer input.")
    }
    
    scanner.close() // 最佳实践：关闭资源
}
```

### 2.3 Kotlin 标准库扩展函数 (推荐)
Kotlin 在 `kotlin.io.ConsoleKt` 中提供了一系列扩展函数，结合了 `readln()` 的简洁和类型转换的便利。这些函数通常在导入 `kotlin.io.*` 后可用，或者在某些环境中默认可用。

*   **常用函数**: `readInt()`, `readLong()`, `readDouble()`, `readBoolean()`, `readLineOrNull()`.
*   **特性**: 内部自动处理 `readln()` 和 `toString().toXxx()`，如果转换失败通常抛出异常或返回 null（取决于具体函数版本和实现，建议查看源码确认，通常 `readInt` 会在解析失败时抛 `NumberFormatException`）。

> **注意**: `readInt()` 等函数并非在所有 Kotlin 平台（如 JS, Native）都一致可用，主要在 JVM 上表现良好。

```kotlin
import kotlin.io.readInt // 显式导入以确保可用性

fun main() {
    print("Enter an integer: ")
    try {
        val num = readInt()
        println("Squared: ${num * num}")
    } catch (e: Exception) {
        println("Please enter a valid integer.")
    }
}
```

**自定义安全扩展函数示例：**
如果你想要一个既安全又方便的 `readIntOrNull`，可以这样写：

```kotlin
fun readIntOrNull(): Int? {
    return readlnOrNull()?.toIntOrNull()
}

fun main() {
    print("Enter a number: ")
    val num = readIntOrNull()
    if (num != null) {
        println("Got: $num")
    } else {
        println("Invalid or empty input.")
    }
}
```

---

## 3. 高级输入处理技巧

### 3.1 批量输入处理 (Split & Map)
在算法竞赛或数据处理中，经常遇到一行包含多个数据的情况，如 `10 20 30`。

```kotlin
fun main() {
    // 假设输入: 10 20 30 40
    print("Enter numbers separated by space: ")
    val line = readln()
    
    // split 默认按空白字符分割，trim 去除首尾空格
    val numbers: List<Int> = line.trim().split("\\s+".toRegex())
                                .map { it.toInt() }
    
    println("Sum: ${numbers.sum()}")
    println("List: $numbers")
}
```

### 3.2 多行输入读取 (GenerateSequence)
当不知道输入有多少行，直到 EOF 结束时，`generateSequence` 是最优雅的 Kotlin 方式。

```kotlin
fun main() {
    println("Enter lines (Ctrl+D/Z to stop):")
    
    // generateSequence 惰性生成序列，每次调用 block 获取下一个元素，直到返回 null
    val lines = generateSequence { readlnOrNull() }
    
    // 转换为列表并处理
    val allLines = lines.toList()
    
    println("Total lines: ${allLines.size}")
    allLines.forEachIndexed { index, line ->
        println("Line $index: $line")
    }
}
```

### 3.3 错误处理与验证循环
健壮的程序必须处理非法输入。

```kotlin
fun readValidAge(): Int {
    while (true) {
        print("Enter your age (1-120): ")
        val input = readlnOrNull() ?: break
        
        try {
            val age = input.toInt()
            if (age in 1..120) {
                return age
            } else {
                println("Age must be between 1 and 120.")
            }
        } catch (e: NumberFormatException) {
            println("Invalid number format. Please try again.")
        }
    }
    throw IllegalStateException("Input stream closed.")
}

fun main() {
    val age = readValidAge()
    println("Valid age entered: $age")
}
```

---