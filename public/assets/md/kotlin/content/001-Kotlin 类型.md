# Kotlin 类型

## 1. 基本类型 (Basic Types)

### 1.1 概述
在 Kotlin 中，**一切皆对象**。这意味着任何变量都可以调用成员函数和属性。
- **没有原始类型（Primitive Types）**：不像 Java 有 `int`, `double`等原始类型，Kotlin 中所有数字、字符、布尔值都是对象。
- **智能优化**：虽然它们在概念上是对象，但编译器在大多数情况下会将它们编译为 JVM 的原始类型（如 `int`, `double`），以保留性能优势。只有在需要可空性（Nullable）或作为泛型参数时，才会装箱（Boxing）。

### 1.2 数字 (Numbers)
Kotlin 处理数字的方式与 Java 非常相似，但语法更简洁，且没有隐式 widening conversion（隐式宽化转换，如 int 自动转 long）。

#### 内置数字类型
| 类型 | 位宽 | 说明 |
| :--- | :--- | :--- |
| `Double` | 64 | 双精度浮点数 |
| `Float` | 32 | 单精度浮点数 |
| `Long` | 64 | 长整型 |
| `Int` | 32 | 整型（最常用） |
| `Short` | 16 | 短整型 |
| `Byte` | 8 | 字节型 |

#### 字面量常量
```kotlin
val dec = 123       // 十进制
val hex = 0x0F      // 十六进制
val bin = 0b00001011 // 二进制

val doubleLit = 123.5   // Double
val floatLit = 123.5f   // Float
val longLit = 123L      // Long
```

#### 数字间的转换
Kotlin **不支持** 隐式转换。例如，你不能直接将 `Int` 赋值给 `Long` 变量，必须显式转换。这有助于避免意外的精度丢失或溢出。

```kotlin
val i: Int = 1
// val l: Long = i  // 编译错误！类型不匹配

val l: Long = i.toLong() // 正确：显式转换
val d: Double = i.toDouble()
```

每个数字类型都支持以下转换函数：
`toByte()`, `toShort()`, `toInt()`, `toLong()`, `toFloat()`, `toDouble()`, `toChar()`

#### 运算操作
Kotlin 支持标准的算术运算符：`+`, `-`, `*`, `/`, `%`。
此外，还支持位运算（注意：Kotlin 中没有 `<<`, `>>` 这样的符号运算符用于位运算，而是使用中缀函数）：
- `shl(bits)` – 有符号左移 (Java 的 `<<`)
- `shr(bits)` – 有符号右移 (Java 的 `>>`)
- `ushr(bits)` – 无符号右移 (Java 的 `>>>`)
- `and(bits)` – 位与
- `or(bits)` – 位或
- `xor(bits)` – 位异或
- `inv()` – 位非

```kotlin
val x = (1 shl 2) and 0x000FF000
```

### 1.3 无符号整数 (Unsigned Integers)
*自 Kotlin 1.3 引入实验性支持，1.5+ 稳定。*

在某些底层开发、网络协议解析或高性能场景中，你需要处理无符号数。Kotlin 提供了以下类型：
- `UByte`: 8-bit unsigned integer (0 to 255)
- `UShort`: 16-bit unsigned integer (0 to 65535)
- `UInt`: 32-bit unsigned integer
- `ULong`: 64-bit unsigned integer

**使用示例：**
```kotlin
val uInt: UInt = 10u
val uLong: ULong = 100uL
val uByte: UByte = 255u

// 转换
val regularInt: Int = uInt.toInt()
```
*注意：在无符号数和有符号数之间进行运算时，通常需要显式转换，或者使用特定的扩展函数。*

### 1.4 布尔 (Booleans)
`Boolean` 类型只有两个值：`true` 和 `false`。

- **逻辑运算符**：`||` (短路或), `&&` (短路与), `!` (非)。
- **不可为空**：除非声明为 `Boolean?`。

```kotlin
val isReady: Boolean = true
if (isReady && checkCondition()) {
    // ...
}
```

### 1.5 字符 (Chars)
`Char` 表示单个字符。它不能直接当作数字处理（这与 C/Java 不同）。

- **字面量**：用单引号 `'c'` 表示。
- **特殊字符**：`\t`, `\b`, `\n`, `\r`, `\'`, `\"`, `\\`, `\$`。
- **Unicode**：可以使用 Unicode 转义序列 `'\uFF00'`。

**重要区别：**
在 Kotlin 中，`Char` **不是** 数字。
```kotlin
fun check(c: Char) {
    if (c == 1) { // 编译错误！类型不匹配：Char vs Int
        // ...
    }
}
```
如果需要将 `Char` 转换为数字代码点，必须显式转换：
```kotlin
val code: Int = 'a'.code // 获取 ASCII/Unicode 值
val char: Char = 97.toChar()
```

### 1.6 字符串 (Strings)
`String` 是不可变的（Immutable）。一旦创建，其内容无法更改。

#### 字符串模板 (String Templates)
Kotlin 强大的特性，允许在字符串中直接嵌入表达式。
```kotlin
val name = "Kotlin"
val version = 1.9

// $ 用于变量
println("Hello, $name")

// ${} 用于任意表达式
println("Version: ${version + 0.1}")
println("Length: ${name.length}")
```

#### 原始字符串 (Raw Strings)
由三个引号 `"""` 包裹。
- 可以包含换行符。
- **不处理** 转义字符（如 `\n` 会被视为两个字符 `\` 和 `n`）。
- 常用于编写 SQL 语句、JSON、HTML 或正则表达式。

```kotlin
val text = """
    for (c in "foo")
        print(c)
"""
// 去除前导空格（trimMargin）
val cleanedText = """
    |Hello
    |World
""".trimMargin()
```

#### 字符串比较
- `==`：比较内容（结构相等性），相当于 Java 的 `.equals()`。
- `===`：比较引用（引用相等性），相当于 Java 的 `==`。

```kotlin
val a = "Hello"
val b = "Hello"
println(a == b)   // true (内容相同)
println(a === b)  // true (Kotlin 编译器会优化字符串常量池，通常也相同，但不保证所有情况)
```

### 1.7 数组 (Arrays)
在 Kotlin 中，数组由 `Array<T>` 类表示。

#### 创建数组
```kotlin
// 1. 使用 arrayOf
val arr1 = arrayOf(1, 2, 3) // Array<Int>

// 2. 使用工厂函数 (推荐用于基本类型，避免装箱开销)
val intArr = intArrayOf(1, 2, 3) // IntArray (对应 int[])
val doubleArr = doubleArrayOf(1.0, 2.0) // DoubleArray

// 3. 使用构造函数
val asc = Array(5) { i -> i * i } // [0, 1, 4, 9, 16]
```

#### 访问与修改
```kotlin
val arr = arrayOf(1, 2, 3)
println(arr[0]) // 读取
arr[0] = 10     // 写入
```

#### 基本类型数组的特化
为了性能，Kotlin 为基本类型提供了特化的数组类，它们在 JVM 上对应原始数组，**没有装箱开销**：
- `ByteArray`, `ShortArray`, `IntArray`, `LongArray`
- `FloatArray`, `DoubleArray`
- `CharArray`, `BooleanArray`

*注意：这些特化数组类没有继承自 `Array`，但它们有相同的属性和方法集。*

### 1.8 其他不常用类型

#### Unit
- 相当于 Java 的 `void`。
- 当函数不返回任何有意义的数据时，返回类型为 `Unit`。
- `Unit` 是一个单例对象，只有一个实例 `Unit`。通常可以省略返回值声明。

```kotlin
fun printHello(): Unit {
    println("Hello")
}
// 等价于
fun printHello() {
    println("Hello")
}
```

#### Nothing
- `Nothing` 类型没有实例。
- 用于标记**永不正常返回**的函数（如抛出异常或无限循环）。
- 是任何类型的子类型（Bottom Type）。

```kotlin
fun fail(message: String): Nothing {
    throw IllegalStateException(message)
}

// 编译器知道 fail() 之后的代码不可达
val s: String = fail("Error") // 编译通过，因为 Nothing 是 String 的子类型，但运行时会抛异常
```

#### Any 和 Any?
- `Any` 是所有非空类型的超类（根类）。相当于 Java 的 `Object`。
- `Any?` 是所有类型（包括 null）的超类。
- 默认情况下，变量是非空的。如果需要接受 null，必须显式声明为可空类型（如 `String?`, `Int?`）。

---

## 2. 类型检测与类型转换 (Type Checks and Casts)

由于 Kotlin 强调类型安全，它提供了智能的类型检查机制。

### 2.1 类型检测：`is` 和 `!is`
使用 `is` 运算符检查对象是否符合某种类型。如果检查通过，编译器通常会自动进行智能转换（Smart Casts）。

```kotlin
fun getStringLength(obj: Any): Int? {
    if (obj is String) {
        // 在这里，obj 被自动转换为 String 类型
        return obj.length 
    }
    // 在这里，obj 仍然是 Any 类型
    return null
}
```

`!is` 用于检查对象是否**不**属于某种类型。

### 2.2 智能转换 (Smart Casts)
这是 Kotlin 的一大亮点。在许多情况下，你不需要显式地使用转换运算符，编译器会根据上下文自动转换类型。

**智能转换生效的条件：**
1. 局部变量 (`val`)。
2. 属性（如果是 `private` 或 `internal`，且在同一个模块中访问；或者该属性没有被开放修改器 `open` 修饰且没有自定义 getter）。
3. 在 `is` 检查之后，且变量在检查和使用的中间没有被修改。

```kotlin
fun demo(x: Any) {
    if (x is String) {
        print(x.length) // x 自动转换为 String
    }
}
```

**智能转换失效的情况：**
- 变量是 `var` 且在检查后被修改。
- 变量是开放的属性（可能被其他线程或子类修改）。
- 使用了复杂的逻辑流，编译器无法保证类型不变。

### 2.3 显式转换：Unsafe Cast (`as`)
如果智能转换不适用，你可以使用 `as` 运算符进行显式转换。

```kotlin
val x: String = y as String
```

**风险**：如果 `y` 不是 `String` 类型，这会抛出 `ClassCastException`。

### 2.4 安全转换：Safe Cast (`as?`)
为了避免异常，推荐使用 `as?` 运算符。如果转换失败，它返回 `null` 而不是抛出异常。

```kotlin
val x: String? = y as? String
if (x != null) {
    // 使用 x
}
```

这通常与 Elvis 运算符 `?:` 结合使用：
```kotlin
val length = (y as? String)?.length ?: 0
```

### 2.5 平台类型 (Platform Types)
*针对你关注的 Java/Kotlin 互操作性*

当从 Java 代码调用 Kotlin 时，或者在 Kotlin 中使用 Java 库时，会遇到“平台类型”（表示为 `T!`）。
- Kotlin 编译器不知道 Java 变量是否可为 null。
- 因此，`T!` 既可以当作 `T` 处理，也可以当作 `T?` 处理。
- **责任在你**：你需要根据 Java 文档或源码判断是否可能为 null。如果判断错误（例如将 null 赋值给非空类型），会在运行时抛出 NPE。

```kotlin
// Java: List<String> getList() { return null; }
// Kotlin:
val list: List<String> = javaObj.getList() // 危险！如果 getList 返回 null，这里会崩
val listSafe: List<String>? = javaObj.getList() // 安全
```

---

## 建议

1. **优先使用不可变类型 (`val`)**：这有助于编译器进行智能转换和优化。
2. **利用智能转换**：写出更简洁、可读性更高的代码，减少显式 cast。
3. **注意基本类型数组**：在高性能场景（如图像处理、大量数值计算）下，使用 `IntArray` 等特化数组而非 `Array<Int>` 以避免装箱开销。
4. **谨慎处理平台类型**：在与 Java 交互时，始终假设 Java 返回的对象可能为 null，除非你有十足把握。
5. **无符号数的使用**：仅在确实需要处理位掩码、网络字节流或与 C/C++ 交互时使用 `UInt` 等类型，普通业务逻辑使用 `Int`/`Long` 即可。