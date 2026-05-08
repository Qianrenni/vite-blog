# Kotlin 注解 (Annotations) 
## 1. 基础概念

### 1.1 什么是注解？
**定义**：
注解（Annotation）是一种元数据（Metadata），它嵌入在代码中，为编译器、运行时环境或开发工具提供关于代码的额外信息。

**核心特征**：
1. **非侵入性**：注解本身不包含业务逻辑，不会直接改变程序的执行流程（除非配合反射或编译时处理）。
2. **声明式**：它告诉系统“这是什么”或“这应该被如何处理”，而不是“怎么做”。

**作用场景**：
- **编译器检查**：如 `@Suppress` 抑制警告，`@Deprecated` 标记过时 API。
- **运行时行为**：如 Spring 的 `@Autowired` 进行依赖注入，JUnit 的 `@Test`识别测试方法。
- **代码生成**：如 Room 数据库通过 `@Entity` 生成 DAO 实现类，Moshi/Kotlinx Serialization 通过 `@Serializable` 生成序列化代码。
- **文档生成**：如 `@Since` 或自定义文档标签。

### 1.2 Kotlin 注解 vs Java 注解

虽然 Kotlin 运行在 JVM 上且与 Java 高度互操作，但在注解的定义和使用上有显著差异：

| 特性 | Java | Kotlin |
| :--- | :--- | :--- |
| **定义关键字** | `@interface` | `annotation class` |
| **默认保留策略** | `CLASS` (编译期保留) | `RUNTIME` (注意：Kotlin 早期版本默认不同，但现在通常建议显式指定。实际上 Kotlin 编译器默认将注解保留在字节码中，但若要反射获取需 `RUNTIME`) *更正：Kotlin 中若无 `@Retention`，默认为 `RUNTIME` 吗？不，Kotlin 默认是 `RUNTIME` 仅当用于反射时方便，但标准行为需看具体实现。实际上，Kotlin 注解如果没有指定 `@Retention`，默认是 `RUNTIME` 以便在 Kotlin 反射中使用，但在 Java 反射中可能不可见除非指定。为了安全，始终显式指定。* <br> **准确说法**：Kotlin 中未指定 `@Retention` 时，默认行为取决于上下文，但通常为了兼容性，建议显式声明。Java 默认是 `CLASS`。 |
| **数组语法** | `{ "A", "B" }` | `arrayOf("A", "B")` 或 `["A", "B"]` |
| **属性映射** | 自动映射到字段/方法 | 需要 **Use-site Targets** (`@field:`, `@get:`) 来明确指定目标 |

**互操作性**：
- Kotlin 定义的注解可以在 Java 中使用，Java 定义的注解也可以在 Kotlin 中使用。
- Kotlin 编译器会自动处理大部分桥接问题，例如将 Kotlin 的 `val` 属性生成的 getter 方法暴露给 Java 注解处理器。

---

## 2. 声明注解

### 2.1 基本语法
在 Kotlin 中，注解是一个特殊的类，使用 `annotation class` 关键字声明。

```kotlin
// 最简单的注解，没有任何参数
annotation class Fancy
```

### 2.2 注解构造函数参数
注解可以像普通类一样拥有主构造函数，用于传递配置信息。

**支持的参数类型**：
1. 对应于 Java 基本类型的 Kotlin 类型 (`Int`, `Long`, `Short`, `Float`, `Double`, `Boolean`, `Byte`, `Char`)。
2. `String`
3. `Class` 引用 (如 `String::class`)
4. 枚举 (`enum`)
5. 其他注解
6. 上述类型的数组 (`Array<T>`)

**重要限制**：
- 注解参数不能有默认值以外的复杂逻辑。
- 参数必须是 `val` (不可变)，因为注解实例在编译后是常量。

**示例**：
```kotlin
annotation class ReplaceWith(
    val expression: String, 
    val imports: Array<String> = [] // 支持默认值
)

// 使用枚举
enum class Level { LOW, HIGH }

annotation class Priority(val level: Level)
```

### 2.3 注解目标 (Use-site Targets) —— Kotlin 的核心特性

这是 Kotlin 注解中最容易混淆但也最强大的部分。

**为什么需要它？**
在 Java 中，一个字段通常对应一个成员变量。但在 Kotlin中，一个属性 (`var name: String`) 在编译成字节码时可能对应多个 Java 元素：
1. 一个私有字段 (`private String name`)
2. 一个 getter 方法 (`public String getName()`)
3. 一个 setter 方法 (`public void setName(String)`)

当你写 `@MyAnnotation var name: String` 时，编译器不知道你想把这个注解加在字段上、getter 上还是 setter 上。

**语法**：
`@target:AnnotationName`

**常用目标详解**：

| 目标 | 说明 | 适用场景 |
| :--- | :--- | :--- |
| `@field` | 应用于生成的 Java 字段 | JPA/Hibernate 映射字段，Gson 序列化字段名 |
| `@get` | 应用于 Getter 方法 | Jackson 序列化 Getter，Bean 验证 |
| `@set` | 应用于 Setter 方法 | 权限控制，Setter 验证 |
| `@param` | 应用于构造函数参数 | Spring 构造器注入，Swagger 参数描述 |
| `@property` | 应用于 Kotlin 属性本身 | **仅在 Kotlin 反射中可见**，Java 反射不可见 |
| `@receiver` | 应用于扩展函数的接收者 | 扩展函数文档或特定处理 |
| `@setparam` | 应用于 Setter 的参数 | 较少用，针对 Setter 传入参数的注解 |

**实战示例**：

```kotlin
import com.google.gson.annotations.SerializedName
import javax.persistence.Column

class User {
    // 场景1: Gson 需要注解在字段上才能正确序列化私有字段
    @field:SerializedName("user_name")
    var userName: String = ""

    // 场景2: JPA 需要注解在字段上定义列名
    @field:Column(name = "email_addr")
    var email: String = ""
    
    // 场景3: 如果你想让 Java 代码通过 Getter 看到某个注解
    @get:Deprecated("Use fullName instead")
    val name: String get() = "$userName"
}
```

---

## 3. 注解元数据 (Meta-Annotations)

元注解是用来修饰“注解”的注解。Kotlin 复用了 Java 的元注解体系，但提供了更友好的枚举类型。

### 3.1 `@Target`
限制注解可以使用的位置。如果不指定，默认可以在任何地方使用。

```kotlin
import kotlin.annotation.AnnotationTarget.*

@Target(CLASS, FUNCTION, PROPERTY_GETTER)
annotation class MyRestrictedAnnotation
```
*如果尝试将 `@MyRestrictedAnnotation` 用在局部变量上，编译器会报错。*

### 3.2 `@Retention`
决定注解的生命周期。

```kotlin
import kotlin.annotation.AnnotationRetention.*

@Retention(SOURCE)   // 源码级：编译后丢弃。用于 lint 检查、代码生成提示。
@Retention(BINARY)   // 字节码级：保留在 .class 文件中，但运行时反射不可见。用于编译时检查。
@Retention(RUNTIME)  // 运行时级：保留在 .class 文件中，且可通过反射读取。用于框架动态处理。
```

**关键点**：
- 如果你希望在使用 `kotlin-reflect` 或 Java Reflection 时读到注解，**必须**使用 `RUNTIME`。
- 很多初学者忘了加这个，导致 `findAnnotation` 返回 null。

### 3.3 `@Repeatable`
允许在同一元素上重复使用同一个注解。

**Kotlin 1.6 之前**：
需要创建一个容器注解（Container Annotation），非常麻烦。

**Kotlin 1.6+**：
直接添加 `@Repeatable` 即可。

```kotlin
@Repeatable
annotation class Tag(val name: String)

@Tag("Frontend")
@Tag("Critical")
class HomePage
```
*底层原理：编译器会自动生成一个包含 `Tag` 数组的容器注解，保持对旧版 Java 工具的兼容。*

### 3.4 `@MustBeDocumented`
指示该注解应包含在生成的 KDoc 或 JavaDoc 公共 API 文档中。通常用于库开发者，表明该注解是公开 API 契约的一部分。

---

## 4. 使用注解

### 4.1 基本使用位置
- 类、接口、对象
- 函数、构造函数
- 属性（Val/Var）
- 参数
- 表达式（局部变量、lambda 参数等，需配合 `@Target(EXPRESSION)`）

### 4.2 数组参数传递
Kotlin 提供了两种传递数组参数的语法，推荐使用方括号语法，更简洁。

```kotlin
annotation class Filters(val values: Array<String>)

// 方式1: 传统 arrayOf
@Filters(arrayOf("admin", "user"))

// 方式2: 方括号语法 (Kotlin 1.2+, 推荐)
@Filters(["admin", "user"])
```

### 4.3 注解作为类型 (Type Annotations)
注解可以放在类型前面，而不是声明前面。这主要用于静态分析工具。

```kotlin
// 这里的 NotNull 注解作用于 List 类型本身，而不是变量 myList
val myList: @NotNull List<String> = listOf("a")
```
*这在 Kotlin 中较少手动编写，通常由编译器或工具自动生成，用于增强空安全检查。*

---

## 5. 运行时处理：反射 (Reflection)

### 5.1 环境准备
要在运行时读取注解，你需要：
1. 注解必须标记为 `@Retention(AnnotationRetention.RUNTIME)`。
2. 项目依赖 `kotlin-reflect` 库。
   ```groovy
   implementation "org.jetbrains.kotlin:kotlin-reflect:$kotlin_version"
   ```

### 5.2 核心 API
Kotlin 反射 API (`kotlin.reflect`) 比 Java 反射更强大，因为它能区分 `property`、`getter` 等 Kotlin 特有概念。

- `KClass<T>.annotations`: 获取类上的所有注解。
- `KProperty<T>.annotations`: 获取属性上的注解。
- `KFunction<T>.annotations`: 获取函数上的注解。
- `T::class.findAnnotation<A>()`: 查找特定类型的注解（返回 nullable）。
- `T::class.getAnnotation<A>()`: 查找特定类型的注解（若不存在抛异常）。

### 5.3 实战：自定义验证框架

这是一个模拟 Spring Validation 或 Hibernate Validator 的简单实现。

```kotlin
import kotlin.reflect.full.findAnnotation
import kotlin.reflect.full.memberProperties

// 1. 定义注解
@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.PROPERTY)
annotation class NotNull

@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.PROPERTY)
annotation class MinLength(val value: Int)

// 2. 定义数据类
data class User(
    @field:NotNull // 注意：这里为了演示反射读取 property，通常用 @property:NotNull 更准确，
                   // 但如果我们要通过 Java 互操作或通用反射，可能需要根据具体情况选择 target。
                   // 在 Kotlin 反射中，@property: 是最直接的。
    @property:NotNull
    val id: String?,

    @property:MinLength(6)
    val password: String
)

// 3. 验证引擎
fun validate(obj: Any) {
    val kClass = obj::class
    val errors = mutableListOf<String>()

    for (prop in kClass.memberProperties) {
        // 检查 NotNull
        if (prop.findAnnotation<NotNull>() != null) {
            prop.isAccessible = true // 允许访问私有属性
            if (prop.get(obj) == null) {
                errors.add("${prop.name} cannot be null")
            }
        }

        // 检查 MinLength
        val minLength = prop.findAnnotation<MinLength>()
        if (minLength != null) {
            prop.isAccessible = true
            val value = prop.get(obj) as? String
            if (value != null && value.length < minLength.value) {
                errors.add("${prop.name} length must be at least ${minLength.value}")
            }
        }
    }

    if (errors.isNotEmpty()) {
        throw IllegalArgumentException("Validation failed:\n${errors.joinToString("\n")}")
    }
}

fun main() {
    try {
        validate(User(null, "123"))
    } catch (e: Exception) {
        println(e.message)
    }
}
```

### 5.4 性能考量
- **反射很慢**：每次调用 `findAnnotation` 或 `getter.call()` 都涉及大量的对象创建和方法查找。
- **优化策略**：
    1. **缓存**：将类的注解信息和属性访问器缓存起来（例如使用 `ConcurrentHashMap`）。
    2. **代码生成**：对于高性能要求的场景（如 JSON 序列化），应避免运行时反射，转而使用 **KSP** 或 **KAPT** 在编译期生成具体的读写代码。

---

## 6. 编译时处理：KSP 与 KAPT

这是现代 Kotlin 开发的分水岭。

### 6.1 KAPT (Kotlin Annotation Processing Tool)
- **原理**：KAPT 是 Java Annotation Processing (JSR 269) 的适配器。它先生成 Java  stubs（桩代码），然后让 Java 注解处理器处理这些 stubs。
- **缺点**：
    - **慢**：生成 stubs 增加了编译时间。
    - **信息丢失**：Stub 是 Java 代码，无法完美表达 Kotlin 特性（如 data class 的 componentN, sealed classes, companion objects 的具体细节）。
    - **增量编译差**：往往导致全量编译。
- **现状**：维护模式。除非你使用的库（如旧版 Dagger 2）只支持 KAPT，否则不建议在新模块中使用。

### 6.2 KSP (Kotlin Symbol Processing)
- **原理**：Google 推出的专为 Kotlin 设计的轻量级 API。它直接读取 Kotlin 编译器的前端符号表，无需生成 Java stubs。
- **优点**：
    - **快**：编译速度显著提升（官方数据称比 KAPT 快 2 倍以上）。
    - **原生支持**：直接理解 Kotlin 的所有语言特性。
    - **增量编译友好**：更好地支持 Gradle 的增量编译。
- **如何工作**：
    1. 开发者编写一个 `SymbolProcessor`。
    2. 在编译过程中，KSP 遍历代码符号。
    3. Processor 根据注解生成新的 Kotlin/Java 文件。
    4. 这些生成的文件参与后续编译。

### 6.3 选择指南

| 场景 | 推荐方案 |
| :--- | :--- |
| 新启动的项目 | **KSP** |
| 需要编写自定义代码生成库 | **KSP** |
| 依赖库仅支持 KAPT (如 Dagger 2 < 2.40) | **KAPT** (被迫) |
| 仅需运行时反射，不生成代码 | **无需处理器** (仅用 Reflection) |
| 简单的编译期检查 (不生成代码) | **KSP** 或 **Compiler Plugin** |

*注：Dagger 2.40+ 和 Hilt 已经支持 KSP。Room 2.5+ 也强烈推荐 KSP。*

---

## 7. 高级主题与最佳实践

### 7.1 注解继承
- **默认行为**：Kotlin 注解**不会**被子类继承。
- **Java 互操作**：如果在 Java 中定义了 `@Inherited` 的注解，Kotlin 子类在通过 Java 反射查看时可能表现出继承性，但在 Kotlin 反射 (`kotlin-reflect`) 中，行为可能不一致。
- **建议**：不要依赖注解继承。如果需要多态行为，建议在运行时递归检查父类或接口上的注解。

### 7.2 文件级注解
有些注解适用于整个文件，而不是单个类。
- **语法**：必须放在文件最顶部，`package` 语句之前。
- **常见用例**：
    - `@file:JvmName("MyUtils")`: 改变生成的 Java 类名。
    - `@file:JvmMultifileClass`: 将多个文件的顶层函数合并到一个 Java 类中。
    - `@file:Suppress("unused")`: 抑制整个文件的警告。

```kotlin
@file:JvmName("StringExtensions")
@file:Suppress("NOTHING_TO_INLINE")

package com.example.utils

fun String.isEmpty(): Boolean { ... }
```

### 7.3 最佳实践总结

1. **显式声明 Retention**：永远不要依赖默认值。问自己：“这个注解需要在运行时被读取吗？”如果是，加 `@Retention(RUNTIME)`；如果只是给编译器看，加 `@Retention(SOURCE)` 或 `BINARY`。
2. **限制 Target**：使用 `@Target` 限制注解的使用范围，防止用户误用（例如把一个只用于类的注解用在了函数上）。
3. **文档化**：为注解类编写清晰的 KDoc，说明每个参数的含义和使用示例。
4. **优先 KSP**：如果你正在构建一个需要生成代码的库（如 ORM、Router、DI），请使用 KSP。它是未来。
5. **避免反射滥用**：在 Android 或高性能服务端应用中，尽量避免在热点路径上使用反射读取注解。考虑在应用启动时一次性扫描并缓存，或者直接使用 KSP 生成静态代码。
6. **Use-site Target 清晰化**：当注解用于属性时，始终明确写出 `@field:` 或 `@get:`，即使编译器能推断，显式写出也能提高代码可读性并避免潜在的互操作 bug。

## 8. 常见内置注解速查
- `@JvmStatic`: 在伴生对象中生成静态方法。
- `@JvmOverloads`: 为带默认参数的函数生成重载方法。
- `@JvmField`: 暴露属性为公共字段，无 getter/setter。
- `@Throws`: 声明函数可能抛出的异常（用于 Java 互操作）。
- `@Suppress`: 抑制编译器警告。
- `@Deprecated`: 标记弃用，可指定替换方案 (`ReplaceWith`)。
- `@Volatile`: 对应 Java 的 `volatile` 关键字。
- `@Synchronized`: 对应 Java 的 `synchronized` 方法。