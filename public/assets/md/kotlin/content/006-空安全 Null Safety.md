# 空安全 (Null Safety)

在 Java 中，`NullPointerException` (NPE) 被称为“十亿美元的错误”。Kotlin 通过区分**可空类型**和**非空类型**，强制开发者在编译期处理 null 值，从而极大地减少了运行时崩溃的风险。

## 1. 可空类型与非空类型

### 类型系统基础

Kotlin 的类型系统明确区分了可以持有 `null` 引用的类型和不能持有 `null` 引用的类型。

*   **非空类型 (`String`)**：
    *   默认情况下，Kotlin 中的所有类型都是非空的。
    *   声明 `val name: String = "Alice"` 后，编译器保证 `name` 永远不会是 `null`。
    *   如果你尝试赋值 `name = null`，编译器会直接报错。

*   **可空类型 (`String?`)**：
    *   通过在类型后添加问号 `?` 来声明可空类型。
    *   声明 `val name: String? = "Alice"` 或 `val name: String? = null` 都是合法的。
    *   这意味着该变量可能包含一个 `String` 对象，也可能是 `null`。

```kotlin
var a: String = "abc"
// a = null // 编译错误：Null can not be a value of a non-null type String

var b: String? = "abc"
b = null // 合法
```

**设计哲学**：Kotlin 选择“默认非空”是因为在大多数业务逻辑中，数据不应该为空。显式标记可空类型迫使开发者思考：“这个字段真的可以为空吗？”如果可以为空，我必须处理它。

### 底层表示与 Java 互操作

在 JVM 字节码层面，Kotlin 的可空类型和非空类型通常都编译为相同的 Java 类型（例如 `java.lang.String`）。区别在于：
1.  **编译期检查**：Kotlin 编译器在生成字节码前进行严格的静态分析。
2.  **注解映射**：当 Kotlin 代码被 Java 调用时，Kotlin 编译器会生成 `@NotNull` 或 `@Nullable` 注解（基于 JSR-305 或 JetBrains 注解），以便 Java 工具（如 IDE 或 FindBugs）能理解空性约束。

### 泛型中的可空性

泛型的可空性需要仔细区分，这是初学者容易混淆的地方：

```kotlin
// 1. 列表本身非空，但元素可能为 null
val list1: List<String?> = listOf("A", null, "B") 

// 2. 列表本身可能为 null，但如果存在，其中的元素必须非空
val list2: List<String>? = null 
// val list2: List<String>? = listOf("A", "B") // 合法

// 3. 列表本身可能为 null，且元素也可能为 null
val list3: List<String?>? = null
```

> **最佳实践**：尽量保持集合本身非空（使用空集合 `emptyList()` 代替 `null`），只让元素可空，这样可以简化调用代码，避免大量的 `?.let` 嵌套。

---

## 2. 空安全检查操作符

为了安全地访问可空类型的成员，Kotlin 提供了一系列操作符。

### 安全调用操作符 (`?.`)

这是最常用的操作符。如果接收者不为 null，则调用方法/属性；如果为 null，则整个表达式返回 null。

```kotlin
val length: Int? = b?.length // 如果 b 是 null，length 也是 null，不会抛出 NPE
```

**链式调用**：
它可以串联使用，只要链条中任何一个环节为 null，结果即为 null。

```kotlin
// Bob?.department?.head?.name
// 如果 Bob 为 null，或者 department 为 null，或者 head 为 null，结果均为 null
val managerName = bob?.department?.head?.name
```

### Elvis 操作符 (`?:`)

Elvis 操作符用于处理“如果为 null，则提供替代值”的逻辑。它的名字来源于其形状像猫王埃尔维斯·普雷斯利的发型。

```kotlin
val l: Int = if (b != null) b.length else -1

// 等价于：
val l: Int = b?.length ?: -1
```

**常见模式**：

1.  **提供默认值**：
    ```kotlin
    val name = user.name ?: "Guest"
    ```

2.  **早期返回 (Early Return)**：
    在函数开头检查必要参数，如果为 null 则直接返回。注意 `return` 是一个表达式，其类型为 `Nothing`，可以与任何类型兼容。
    ```kotlin
    fun process(data: String?) {
        val validData = data ?: return // 如果 data 为 null，函数在此结束
        println(validData.length) // 这里 validData 肯定是非空的
    }
    ```

3.  **抛出异常**：
    ```kotlin
    val value = config.getValue() ?: throw IllegalStateException("Config missing")
    ```

### 非空断言操作符 (`!!`)

`!!` 操作符将任何值转换为非空类型，如果值为 null，则抛出 `KotlinNullPointerException`。

```kotlin
val l = b!!.length // 如果 b 是 null，这里会崩溃
```

**使用场景与警告**：
*   **尽量避免使用**：它违背了空安全的初衷。
*   **何时使用**：
    1.  你拥有比编译器更多的上下文信息（例如，你知道某个回调一定会被调用，或者某个值已在其他地方初始化）。
    2.  用于测试目的，故意触发崩溃以验证错误处理路径。
    3.  在遗留代码重构初期，作为临时手段，随后应逐步替换为更安全的写法。

### 安全转换 (`as?`)

普通的 `as` 转换在失败时会抛出 `ClassCastException`。`as?` 在转换失败时返回 `null`，非常适合与 Elvis 操作符结合使用。

```kotlin
val aInt: Int? = a as? Int

// 结合 Elvis：如果转换失败，使用默认值 0
val value: Int = a as? Int ?: 0
```

---

## 3. 智能转换 (Smart Casts)

Kotlin 编译器非常聪明，它能够跟踪代码逻辑。如果你已经检查过变量是否为 null，那么在随后的代码块中，编译器会自动将该变量视为非空类型，无需手动转换或使用 `?.`。

### 原理

```kotlin
fun getStringLength(obj: Any): Int? {
    if (obj is String) {
        // 在这个分支里，obj 自动被智能转换为 String 类型
        return obj.length // 可以直接访问 String 的属性，无需 (obj as String).length
    }
    
    // 在这里，obj 仍然是 Any 类型
    return null
}
```

对于空检查同样有效：

```kotlin
fun printLength(str: String?) {
    if (str != null) {
        // str 在这里被智能转换为 String
        println(str.length) 
    }
}
```

### 限制条件

智能转换并非在所有情况下都可用，主要受限于**变量的可变性**和**可见性**。

1.  **局部 `val` 变量**：最安全，总是支持智能转换。
2.  **局部 `var` 变量**：
    *   如果在检查和使用的中间，变量没有被修改，支持智能转换。
    *   如果变量可能被**局部函数**或**Lambda**修改，编译器无法保证线程安全或执行顺序，因此**不支持**智能转换。
    ```kotlin
    var x: String? = "Hello"
    
    // 错误：Smart cast to 'String' is impossible, because 'x' is a mutable property 
    // that could have been changed by this time
    if (x != null) {
        someFunctionThatMightChangeX() 
        println(x.length) 
    }
    ```
    *   **解决方法**：将值复制到局部的 `val` 中。
    ```kotlin
    val y = x
    if (y != null) {
        println(y.length) // 安全，y 是不可变的
    }
    ```

3.  **成员属性**：
    *   如果属性是 `open` 的，或者有自定义 getter，编译器无法保证每次访问返回相同的值，因此不支持智能转换。
    *   **解决方法**：同样建议使用局部变量缓存，或使用 `lateinit` / `by lazy` 等委托属性（如果适用）。

### 显式转换 (`as`)

当智能转换不可用时，你可以使用显式转换 `as`。
*   `as`：不安全，失败抛异常。
*   `as?`：安全，失败返回 null。

---

## 4. 平台类型 (Platform Types)

当你从 Java 代码调用 Kotlin，或在 Kotlin 中调用 Java 代码时，会遇到**平台类型**。

### 什么是平台类型？

Java 的类型系统没有内置的空安全概念。虽然 Java 8 引入了 `Optional`，但大多数现有 Java 库仍然使用裸引用。
当 Kotlin 看到来自 Java 的类型（例如 `java.lang.String`）时，它不知道这个引用是否可以为 null。因此，Kotlin 将其表示为**平台类型**，记作 `String!`（注意感叹号，但这只是文档表示，代码中不能直接写 `String!`）。

```kotlin
// 假设这是一个 Java 方法: public String getName() { ... }
val name = javaObject.getName() // name 的类型是 String! (平台类型)
```

对于平台类型：
*   Kotlin 编译器**不执行**空安全检查。
*   你可以把它当作 `String` 使用（可能导致运行时 NPE）。
*   你也可以把它当作 `String?` 使用（需要处理 null）。
*   **责任完全在开发者身上**。

### 处理策略

1.  **显式声明类型**：
    不要依赖类型推断来处理来自 Java 的返回值。显式声明它是可空还是非空，表明你的意图。
    ```kotlin
    // 如果你确定 Java 方法不会返回 null
    val name: String = javaObject.getName() 
    
    // 如果可能返回 null
    val name: String? = javaObject.getName()
    ```

2.  **使用注解辅助**：
    现代 Java 库和 Android SDK 广泛使用注解来标记空性：
    *   `@NotNull` / `@Nonnull`：Kotlin 将其视为非空类型 (`String`)。
    *   `@Nullable` / `@CheckForNull`：Kotlin 将其视为可空类型 (`String?`)。
    
    确保你的项目配置了正确的注解处理器（如 IntelliJ 注解、AndroidX 注解或 JSR-305）。

3.  **Android 开发**：
    Android SDK 的大部分 API 都已经添加了空性注解。在 Android Studio 中，调用 Android API 时，Kotlin 通常能正确推断出可空性。如果遇到未标注的 API，务必查阅文档或源码确认。

---

## 5. 可空集合与数组

处理集合时，需要区分“集合为空”和“集合元素为空”。

### 三种状态

1.  **`List<String>`**：列表本身不为 null，且所有元素都不为 null。
2.  **`List<String?>`**：列表本身不为 null，但内部可能包含 null 元素。
    ```kotlin
    val list: List<String?> = listOf("A", null, "B")
    ```
3.  **`List<String>?`**：列表本身可能为 null。如果列表存在，则其中元素非空。
    ```kotlin
    val list: List<String>? = null
    ```

### 过滤与处理 API

Kotlin 标准库提供了强大的扩展函数来处理可空集合：

*   **`filterNotNull()`**：
    从 `List<T?>` 中移除所有 null 元素，返回 `List<T>`。
    ```kotlin
    val mixed: List<String?> = listOf("A", null, "B", null, "C")
    val nonNull: List<String> = mixed.filterNotNull() // ["A", "B", "C"]
    ```

*   **`mapNotNull()`**：
    先映射，然后过滤掉结果为 null 的元素。这比 `map { ... }.filterNotNull()` 更高效，因为它只遍历一次。
    ```kotlin
    val strings = listOf("1", "abc", "2")
    val numbers: List<Int> = strings.mapNotNull { it.toIntOrNull() } // [1, 2]
    ```

*   **安全访问元素**：
    *   `list.firstOrNull()`：如果列表为空，返回 null 而不是抛异常。
    *   `list.getOrNull(index)`：如果索引越界，返回 null。
    *   `map[key]`：对于 Map，如果 key 不存在，直接返回 null（因为 Map 的 get 操作天然支持可空返回值）。

### 最佳实践总结

1.  **优先使用非空类型**：在定义数据模型时，除非业务逻辑允许，否则不要使用 `?`。
2.  **利用 Elvis 操作符**：简洁地处理默认值和早期返回。
3.  **慎用 `!!`**：把它看作最后的 resort。
4.  **注意平台类型**：在与 Java 互操作时，始终显式声明空性预期。
5.  **善用 `filterNotNull` 和 `mapNotNull`**：优雅地清理数据流中的 null 值。