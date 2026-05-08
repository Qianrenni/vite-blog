# 相等性 (Equality)

在 Java 中，`==` 用于基本类型比较值，用于对象比较引用，而 `.equals()` 用于比较对象内容。这种双重标准经常导致混淆。Kotlin 通过引入两个不同的操作符 `==` 和 `===` 来清晰地分离这两种概念。

## 1. 结构相等性 vs 引用相等性

### 结构相等性 (`==`)

**定义**：检查两个对象是否具有相同的**内容**或**值**。

*   **底层机制**：
    `a == b` 在编译时会被转换为 `a?.equals(b) ?: (b === null)`。
    这意味着：
    1.  如果 `a` 不为 null，调用 `a.equals(b)`。
    2.  如果 `a` 为 null，则检查 `b` 是否也为 null（使用引用相等 `===`）。
    
    **关键点**：Kotlin 的 `==` 是**空安全**的。你不需要担心 `null == something` 会抛出 NPE。

*   **示例**：
    ```kotlin
    val name1 = String("Hello") // 创建一个新的 String 对象
    val name2 = String("Hello") // 创建另一个新的 String 对象
    
    println(name1 == name2) // true  (内容相同)
    println(name1 === name2) // false (内存地址不同)
    
    val nullStr: String? = null
    println(nullStr == "Hello") // false (安全，不抛异常)
    ```

### 引用相等性 (`===`)

**定义**：检查两个引用是否指向**内存中的同一个对象实例**。

*   **底层机制**：
    对应 Java 中的 `==` 操作符。它比较的是对象的内存地址（引用）。

*   **基本数据类型的特殊情况**：
    在 Kotlin 中，`Int`, `Double`, `Boolean` 等基本类型在运行时通常被映射为 Java 的基本类型（primitive），除非它们被装箱（例如放在 `List<Int>` 中或声明为 `Int?`）。
    *   对于未装箱的基本类型（如局部变量 `val a: Int = 1`），`===` 和 `==` 效果一样，都比较值。
    *   对于**装箱后**的基本类型（`Int?`），`===` 比较的是引用。这就引入了著名的**整数缓存陷阱**（见下文第 3 部分）。

    ```kotlin
    val a: Int = 100
    val b: Int = 100
    println(a === b) // true (在 JVM 上作为 primitive int 比较，或者命中缓存)
    
    val x: Int? = 1000
    val y: Int? = 1000
    println(x === y) // false (两个不同的 Integer 对象)
    println(x == y)  // true  (值相等)
    ```

> **最佳实践**：在比较业务逻辑数据（字符串、数字、自定义对象）时，**始终使用 `==`**。仅在需要判断是否为同一个实例（如单例、缓存键、链表节点检测）时使用 `===`。

---

## 2. `equals()` 与 `hashCode()` 约定

如果你重写 `equals()`，必须同时重写 `hashCode()`。这是 Java/Kotlin 集合框架（HashMap, HashSet）正常工作的基石。

### 通用契约

1.  **自反性**：`x.equals(x)` 必须返回 `true`。
2.  **对称性**：如果 `x.equals(y)` 为 `true`，则 `y.equals(x)` 也必须为 `true`。
3.  **传递性**：如果 `x.equals(y)` 且 `y.equals(z)`，则 `x.equals(z)` 必须为 `true`。
4.  **一致性**：多次调用 `equals` 应返回相同结果（前提是对象状态未变）。
5.  **HashCode 约束**：如果 `x.equals(y)` 为 `true`，那么 `x.hashCode()` 必须等于 `y.hashCode()`。
    *   *注意*：如果 `hashCode` 相同，`equals` 不一定为 true（哈希碰撞），但如果 `equals` 为 true，`hashCode` 必须相同。

### 数据类 (Data Classes) 的自动生成

Kotlin 的 `data class` 是为了解决这个问题而生的。编译器会自动根据**主构造函数**中声明的所有属性生成 `equals()`, `hashCode()`, `toString()`, `copy()` 和 `componentN()`。

```kotlin
data class User(val id: Int, val name: String)

fun main() {
    val u1 = User(1, "Alice")
    val u2 = User(1, "Alice")
    val u3 = User(1, "Bob")
    
    println(u1 == u2) // true  (自动生成的 equals 比较 id 和 name)
    println(u1 == u3) // false
    println(u1.hashCode() == u2.hashCode()) // true
}
```

**关于排除属性**：
`data class` 默认使用所有主构造参数。如果你想让某个属性不参与相等性比较（例如一个临时计算的字段或数据库版本戳），你有两个选择：
1.  **不使用 data class**：使用普通 `class` 并手动编写 `equals/hashCode`。
2.  **将属性移到 body 中**：只有主构造函数中的属性才会被自动包含。
    ```kotlin
    data class User(val id: Int, val name: String) {
        var lastAccessTime: Long = 0 // 这个属性不参与 equals/hashCode
    }
    ```

**`copy()` 与相等性**：
`copy()` 方法创建的对象，除了被修改的属性外，其他属性与原对象相同。因此，如果只修改了非关键属性，`copy` 后的对象可能与原对象 `equals` 为 true；如果修改了参与 equals 的属性，则为 false。

### 手动重写最佳实践

如果必须手动重写（例如在非 data class 中）：

1.  **使用标准库辅助**：
    Kotlin 提供了 `kotlin.jvm.internal.Intrinsics.areEqual` (内部使用) 或更通用的方式。在 Java 互操作或复杂逻辑中，可以使用 `java.util.Objects.equals(a, b)` 来处理 null。
    
2.  **避免可变状态**：
    **千万不要**在 `equals` 或 `hashCode` 中使用可变属性（`var`）。
    *   **原因**：如果一个对象被放入 `HashSet`，它的 `hashCode` 决定了它在哈希表中的桶位置。如果之后你修改了该对象的一个参与 `hashCode` 计算的属性，它的 `hashCode` 会变，但它在 HashSet 中的位置不会变。当你尝试查找或删除它时，HashSet 会用新的 `hashCode` 去错误的桶里找，导致找不到该对象，造成内存泄漏或逻辑错误。
    *   **建议**：用于相等性比较的属性最好是 `val`（不可变）。

---

## 3. 特殊类型的相等性陷阱

### 浮点数比较 (`Float` / `Double`)

浮点数遵循 IEEE 754 标准，这带来了一些反直觉的行为：

1.  **NaN (Not a Number)**：
    *   `NaN != NaN` 总是成立。
    *   在 Kotlin/Java 中，`Double.NaN == Double.NaN` 返回 `false`。
    *   但是，`listOf(Double.NaN).contains(Double.NaN)` 可能返回 `true`，因为某些集合实现有特殊处理。这非常危险。

2.  **-0.0 与 0.0**：
    *   `-0.0 == 0.0` 返回 `true`。
    *   但是 `-0.0` 和 `0.0` 的位表示不同，某些底层操作可能区分它们。

**建议**：
*   不要直接使用 `==` 比较浮点数是否相等，尤其是经过计算后的结果。
*   使用误差范围（Epsilon）比较：
    ```kotlin
    fun Double.isApproximatelyEqual(other: Double, epsilon: Double = 1e-6): Boolean {
        return kotlin.math.abs(this - other) < epsilon
    }
    ```

### 整数装箱缓存 (Integer Cache)

这是 JVM 的特性，但在 Kotlin 中经常坑到初学者。JVM 为了性能，会缓存 `-128` 到 `127` 之间的 `Integer` 对象。

```kotlin
fun main() {
    // 场景 1: 小整数 (在缓存范围内)
    val a: Int? = 100
    val b: Int? = 100
    println(a === b) // true! 因为它们指向缓存中的同一个对象
    
    // 场景 2: 大整数 (超出缓存范围)
    val c: Int? = 200
    val d: Int? = 200
    println(c === d) // false! 它们是两个不同的 Integer 对象
    
    // 场景 3: 无论大小，值比较永远可靠
    println(a == b) // true
    println(c == d) // true
}
```

**结论**：
*   对于 `Int?`, `Long?`, `Boolean?` 等包装类型，**永远使用 `==`** 进行值比较。
*   **永远不要依赖 `===` 的结果来判断数值相等**，除非你明确知道自己在处理单例或特定的引用身份。

---

## 4. 集合中的相等性

Kotlin 标准库中的集合实现了基于内容的相等性。

### List 相等性
*   **顺序敏感**：两个 List 相等，当且仅当它们大小相同，且对应位置的元素相等（`==`）。
    ```kotlin
    println(listOf(1, 2, 3) == listOf(1, 2, 3)) // true
    println(listOf(1, 2, 3) == listOf(3, 2, 1)) // false
    ```

### Set 相等性
*   **顺序无关**：两个 Set 相等，当且仅当它们包含完全相同的元素。
    ```kotlin
    println(setOf(1, 2, 3) == setOf(3, 2, 1)) // true
    println(setOf(1, 2) == setOf(1, 2, 3))     // false
    ```
*   **依赖 hashCode/equals**：Set 的正确行为强烈依赖于元素的 `hashCode` 和 `equals` 实现。如果自定义对象没有正确重写这两个方法，`Set` 将无法去重或正确判断相等性。

### Map 相等性
*   **键值对集合**：两个 Map 相等，当且仅当它们拥有相同的键集，且每个键对应的值也相等。
*   **顺序无关**：对于 `HashMap`，插入顺序不影响相等性。
    ```kotlin
    val map1 = mapOf("a" to 1, "b" to 2)
    val map2 = mapOf("b" to 2, "a" to 1)
    println(map1 == map2) // true
    ```

---

## 5. 身份识别与唯一性

虽然 `==` 是最常用的，但 `===`（引用相等）在特定场景下不可或缺。

### 何时使用引用相等性 (`===`)

1.  **单例模式检查**：
    确保你拿到的是全局唯一的那个实例。
    ```kotlin
    if (config === AppConfig.INSTANCE) { ... }
    ```

2.  **缓存命中判断 (Identity Map)**：
    有些缓存策略希望区分两个内容相同但不同的对象（例如，跟踪对象的生命周期或变更）。

3.  **检测循环引用**：
    在序列化或遍历图结构时，需要判断当前节点是否就是之前访问过的某个节点（内存地址相同），以防止死循环。
    ```kotlin
    fun traverse(node: Node?, visited: MutableSet<Node> = mutableSetOf()) {
        if (node == null) return
        if (visited.any { it === node }) return // 防止循环
        visited.add(node)
        // ... process children
    }
    ```

4.  **优化性能**：
    在某些高频调用场景下，如果已知两个引用指向同一对象，可以直接跳过昂贵的 `equals` 内容比较。
    ```kotlin
    if (this === other) return true // 快速路径
    if (other !is MyClass) return false
    // 接着进行详细的字段比较
    ```

### `Any` 类中的方法

所有 Kotlin 类都继承自 `Any`（类似于 Java 的 `Object`）。它定义了三个核心方法：

1.  **`equals(other: Any?): Boolean`**：
    *   默认实现是比较引用（`===`）。
    *   数据类和普通类通常会重写它以比较内容。

2.  **`hashCode(): Int`**：
    *   默认实现通常基于内存地址转换而来（具体取决于 JVM 实现）。
    *   重写 `equals` 时必须重写此方法。

3.  **`toString(): String`**：
    *   默认实现是 `ClassName@HexHashCode`。
    *   数据类会自动生成包含属性值的友好字符串表示。

---

### 总结

*   **默认使用 `==`**：它安全、直观，比较的是内容。
*   **谨慎使用 `===`**：仅在关心“是否是同一个对象实例”时使用。
*   **Data Class 是好伙伴**：让它们帮你处理 `equals` 和 `hashCode`，但要记住它们只包含主构造函数的属性。
*   **警惕浮点数和装箱整数**：不要假设 `===` 对数字有效，不要直接用 `==` 比较浮点精度。
*   **集合依赖相等性**：确保放入 `Set` 或 `Map` 键的对象正确实现了 `equals/hashCode`，否则集合行为将不可预测。