# Kotlin 反射

## 1. 基础概念与环境准备

### 1.1 什么是反射？

**定义**：
反射（Reflection）是一种机制，允许程序在**运行时（Runtime）**动态地获取类的信息（如类名、属性、方法、构造函数、注解等），并能够动态地创建对象、调用方法或访问/修改字段，而无需在编译时硬编码这些细节。

**Kotlin 反射 vs Java 反射**：

虽然 Kotlin 运行在 JVM 上，最终字节码与 Java 兼容，但 Kotlin 语言特性（如空安全、默认参数、扩展函数、委托属性）在 Java 反射 API (`java.lang.reflect`) 中无法直接体现或处理起来非常繁琐。因此，Kotlin 提供了自己的反射库 `kotlin-reflect`。

| 特性 | Java 反射 (`java.lang.reflect`) | Kotlin 反射 (`kotlin.reflect`) |
| :--- | :--- | :--- |
| **核心类** | `Class<?>`, `Field`, `Method`, `Constructor` | `KClass<T>`, `KProperty`, `KFunction`, `KConstructor` |
| **空安全** | 无法区分 `String` 和 `String?` | `KType.isMarkedNullable` 明确标识可空性 |
| **默认参数** | 难以处理，需手动计算参数索引 | `callBy(map)` 原生支持命名参数和默认值 |
| **扩展函数** | 视为静态方法，丢失“扩展”语义 | `KFunction` 保留扩展接收者信息 |
| **委托属性** | 只能看到生成的 getter/setter | 可通过 `getDelegate()` 获取委托对象实例 |
| **数据类** | 无特殊标识 | `isData` 属性直接判断 |

**核心优势**：
Kotlin 反射不仅提供了对 JVM 结构的访问，还保留了 **Kotlin 特有的元数据**。这使得编写框架（如序列化、DI、ORM）时，能够更自然地处理 Kotlin 代码逻辑，而不是被迫适配 Java 的视角。

### 1.2 依赖配置

Kotlin 的标准库 `kotlin-stdlib` **不包含**完整的反射支持。你需要额外引入 `kotlin-reflect`。

**为什么分开？**
`kotlin-reflect` 体积较大（约 3MB+），且初始化开销高。许多小型应用或 Android 应用可能不需要反射功能，分离依赖有助于减小包体积。

**Gradle 配置 (Kotlin DSL):**
```kotlin
dependencies {
    implementation("org.jetbrains.kotlin:kotlin-reflect:1.9.0") // 版本需与 kotlin stdlib 一致
}
```

**Maven 配置:**
```xml
<dependency>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-reflect</artifactId>
    <version>1.9.0</version>
</dependency>
```

**多平台支持现状：**
*   **JVM**: 完全支持。
*   **JS**: 支持有限。由于 JS 是动态语言，很多反射操作可以通过动态特性实现，但 `kotlin-reflect` 在 JS 目标中通常不可用或行为不同。通常建议使用动态类型 `dynamic`。
*   **Native**: 支持非常有限。由于 AOT 编译和树摇（Tree Shaking）优化，未使用的类可能被裁剪，导致反射找不到类。目前主要用于调试或特定场景，不建议在生产环境重度依赖。

### 1.3 核心 API 概览

所有 Kotlin 反射接口都位于 `kotlin.reflect` 包下。为了简化操作，绝大多数实用扩展函数位于 `kotlin.reflect.full` 包中，建议始终导入此包。

```kotlin
import kotlin.reflect.KClass
import kotlin.reflect.KProperty
import kotlin.reflect.KFunction
import kotlin.reflect.full.* // 重要：包含 memberProperties, callBy 等扩展
```

*   **`KClass<T>`**: 对应 Java 的 `Class<T>`，但提供了更多 Kotlin 视角的信息（如 `isData`, `objectInstance`）。
*   **`KProperty<R>`**: 代表一个属性。如果是 `var`，则是 `KMutableProperty<R>`。它封装了 getter 和 setter。
*   **`KFunction<R>`**: 代表一个函数或方法。包含参数列表、返回类型、是否为 suspend 等信息。
*   **`KType`**: 代表一个具体的类型，包括泛型参数和可空性。例如 `List<String?>` 是一个 `KType`，其 classifier 是 `List`，arguments 包含 `String?`。

---

## 2. 类与对象的操作 (KClass)

### 2.1 获取 KClass 实例

有三种主要方式获取 `KClass`：

1.  **编译时已知类型 (`T::class`)**：
    ```kotlin
    val kClass: KClass<String> = String::class
    ```
    *注意：这返回的是静态类型的 KClass。如果 `T` 是泛型，由于擦除，你可能得不到具体的泛型信息。*

2.  **运行时实例类型 (`obj::class`)**：
    ```kotlin
    val str = "Hello"
    val kClass: KClass<out String> = str::class
    ```
    *这会返回对象实际所属类的 KClass。*

3.  **从 Java Class 转换**：
    ```kotlin
    val javaClass: Class<MyClass> = MyClass::class.java
    val kClass: KClass<MyClass> = javaClass.kotlin
    ```

**对比 `Class.forName()`**:
Java 的 `Class.forName("com.example.MyClass")` 返回 `Class<?>`。若要转为 `KClass`，需调用 `.kotlin` 扩展属性。Kotlin 没有直接的字符串到 `KClass` 的全局查找函数，通常依赖 Java 互操作或自定义类加载器扫描。

### 2.2 类信息查询

```kotlin
data class User(val name: String, val age: Int)

val kClass = User::class

// 名称
println(kClass.simpleName)    // "User"
println(kClass.qualifiedName) // "com.example.User"

// 可见性与特征
println(kClass.isPublic)      // true
println(kClass.isData)        // true
println(kClass.isAbstract)    // false
println(kClass.isFinal)       // true (data classes are final by default)

// 继承体系
println(kClass.superclasses)  // [class kotlin.Any]
```

对于 **Sealed Classes**，这是一个强大的功能：
```kotlin
sealed class Result
class Success(val data: String) : Result()
class Error(val msg: String) : Result()

val sealedKClass = Result::class
// 获取所有直接子类
println(sealedKClass.sealedSubclasses) 
// [class com.example.Success, class com.example.Error]
```

### 2.3 实例化

**无参构造**：
```kotlin
class EmptyClass()
val instance = EmptyClass::class.createInstance()
```
*注意：如果类没有无参构造函数，`createInstance()` 会抛出异常。*

**有参构造**：
这是 Kotlin 反射最强大的地方之一，因为它支持**默认参数**。

```kotlin
class Config(val host: String = "localhost", val port: Int = 8080)

val constructor = Config::class.constructors.first()

// 方式 1: call (位置参数，必须提供所有参数，忽略默认值)
// val obj1 = constructor.call("127.0.0.1", 3000) 

// 方式 2: callBy (映射参数，支持默认值和命名参数) - 推荐
val params = constructor.parameters.associateBy { it.name }
val obj2 = constructor.callBy(mapOf(
    params["host"] to "example.com" 
    // port 未提供，将使用默认值 8080
))
println(obj2.port) // 8080
```

---

## 3. 属性反射 (KProperty)

### 3.1 获取属性

```kotlin
data class Person(val name: String, var age: Int)

val kClass = Person::class

// 获取所有成员属性（包括继承的）
val allProps = kClass.memberProperties

// 仅获取当前类声明的属性
val declaredProps = kClass.declaredMemberProperties

// 按名称查找
val nameProp = kClass.memberProperties.find { it.name == "name" }
```

### 3.2 读取与写入

```kotlin
val person = Person("Alice", 30)
val nameProp = Person::class.memberProperties.find { it.name == "name" } as KProperty1<Person, String>
val ageProp = Person::class.memberProperties.find { it.name == "age" } as KMutableProperty1<Person, Int>

// 读取
val name = nameProp.get(person) // "Alice"
// 或者使用 getter
val name2 = nameProp.getter.call(person)

// 写入 (仅限 KMutableProperty)
ageProp.set(person, 31)
// 或者使用 setter
ageProp.setter.call(person, 32)
```

**类型安全警告**：
`memberProperties` 返回的是 `KProperty<*>`。在实际操作中，通常需要强制转换或检查类型，否则 `get` 返回的是 `Any?`。使用 `KProperty1<Receiver, ReturnType>` 可以提供更好的类型推断。

### 3.3 处理 Kotlin 特有特性

**Nullability**:
```kotlin
class Data(val optional: String?)
val prop = Data::class.memberProperties.first()
println(prop.returnType.isMarkedNullable) // true
```

**Delegated Properties (委托属性)**:
Kotlin 的 `by lazy`, `by observable` 等委托在反射中有特殊支持。

```kotlin
import kotlin.properties.Delegates

class Example {
    var observed: String by Delegates.observable("<init>") { prop, old, new ->
        println("$old -> $new")
    }
}

val ex = Example()
val prop = Example::class.memberProperties.first() as KMutableProperty<*>

// 检查是否委托
if (prop is KProperty.Delegated) {
    // 获取委托对象实例
    val delegate = prop.getDelegate(ex)
    println(delegate::class.simpleName) // "ObservableProperty"
}
```
*应用场景*：在调试工具中，你可能想知道某个属性的值变化监听器是谁；或者在序列化时，需要知道底层存储结构。

**Backing Fields**:
Kotlin 反射**不直接暴露** backing field。你只能通过 getter/setter 访问。如果需要直接操作字段（例如绕过自定义 getter 逻辑），必须回退到 Java 反射：
```kotlin
val javaField = Person::class.java.getDeclaredField("name")
javaField.isAccessible = true
val value = javaField.get(person)
```

---

## 4. 函数与方法反射 (KFunction)

### 4.1 获取函数

```kotlin
class Calculator {
    fun add(a: Int, b: Int) = a + b
    private fun secret() = 42
}

val kClass = Calculator::class

// 获取所有公共成员函数
val functions = kClass.memberFunctions

// 获取特定函数
val addFunc = kClass.memberFunctions.find { it.name == "add" }
```

### 4.2 调用函数

```kotlin
val calc = Calculator()
val addFunc = Calculator::class.memberFunctions.find { it.name == "add" }!!

// 方式 1: call (位置参数)
val result1 = addFunc.call(calc, 10, 20) // 30

// 方式 2: callBy (命名参数 + 默认参数)
// 假设函数定义为: fun greet(name: String = "World") = "Hello $name"
val params = addFunc.parameters.associateBy { it.name }
// 注意：第一个参数通常是实例本身 (instance)，除非是扩展函数或静态方法
val instanceParam = params[null] // 或者 find { it.kind == KParameter.Kind.INSTANCE }
val aParam = params["a"]
val bParam = params["b"]

val result2 = addFunc.callBy(mapOf(
    instanceParam to calc,
    aParam to 5,
    bParam to 15
))
```

**处理重载**：
`memberFunctions` 会返回所有同名函数。你需要通过 `parameters.size` 或 `parameters.map { it.type }` 来区分重载版本。

### 4.3 参数与返回值分析

```kotlin
fun analyze(func: KFunction<*>) {
    println("Return Type: ${func.returnType}")
    println("Is Suspend: ${func.isSuspend}")
    println("Parameters:")
    func.parameters.forEach { param ->
        println("  Name: ${param.name}, Type: ${param.type}, Is Optional: ${param.isOptional}")
    }
}
```
*   `isSuspend`: 判断是否为协程挂起函数。如果是，调用时需要特殊的协程上下文处理（通常不能直接 `call`，需借助 `CoroutineStart` 或包装）。
*   `isOptional`: 对应 Kotlin 的默认参数。

---

## 5. 类型系统与泛型 (KType)

### 5.1 KType 详解

在 Java 中，`List<String>.class` 是不合法的，泛型信息在运行时被擦除。但在 Kotlin 反射中，`KType` 保留了丰富的信息。

```kotlin
class Container<T> {
    lateinit var data: List<T?>
}

val prop = Container::class.memberProperties.first() // data
val type = prop.returnType // KType for List<T?>

println(type.classifier) // interface kotlin.collections.List
println(type.arguments)  // [KTypeProjection(variance=INVARIANT, type=T?)]
println(type.isMarkedNullable) // false (List itself is not nullable)

// 深入泛型参数
val innerType = type.arguments.first().type
println(innerType?.isMarkedNullable) // true (T is nullable)
```

### 5.2 泛型擦除与保留

**JVM 限制**：
尽管 `KType` 看起来保留了泛型，但在 JVM 上，如果泛型类型参数 `T` 没有被具体化（reified），你在运行时仍然无法知道 `T` 具体是 `String` 还是 `Int`，除非该信息来自签名（Signature）且未被擦除。

**`typeOf<T>()` 的威力**：
Kotlin 1.3.50 引入了 `typeOf<T>()`，它利用内联函数和 reified 类型参数，在编译期捕获类型信息并生成常量。这比传统的反射更高效、更准确。

```kotlin
import kotlin.reflect.typeOf

val stringListType = typeOf<List<String>>()
val nullableIntType = typeOf<Int?>()

println(stringListType) // kotlin.collections.List<kotlin.String>
println(nullableIntType.isMarkedNullable) // true
```
*建议*：在新代码中，优先使用 `typeOf` 进行类型比较和检查，而不是手动构建 `KType`。

---

## 6. 高级应用场景

### 6.1 自定义注解处理

注解是反射最常见的用途之一，用于配置行为。

```kotlin
@Target(AnnotationTarget.PROPERTY)
annotation class JsonIgnore

data class User(
    val name: String,
    @JsonIgnore val password: String
)

fun toJson(obj: Any): String {
    val jsonMap = mutableMapOf<String, Any?>()
    val kClass = obj::class
    
    for (prop in kClass.memberProperties) {
        // 检查是否有 JsonIgnore 注解
        if (prop.findAnnotation<JsonIgnore>() != null) {
            continue
        }
        jsonMap[prop.name] = prop.getter.call(obj)
    }
    return jsonMap.toString() // 简易 JSON
}
```

### 6.2 序列化与反序列化框架原理

一个简单的通用序列化器思路：
1.  获取对象的 `KClass`。
2.  遍历 `memberProperties`。
3.  对于每个属性：
    *   如果是基本类型/String，直接取值。
    *   如果是自定义对象，递归调用序列化。
    *   如果是集合，遍历元素。
4.  构建 Map 或 JSON 树。

*注意*：生产环境请使用 `kotlinx.serialization` 或 Jackson/Gson。手动反射序列化性能差且容易出错（循环引用、私有属性等）。

### 6.3 依赖注入 (DI) 容器简易实现

核心逻辑：
1.  **注册**：将类与其对应的 `KClass` 绑定。
2.  **解析**：当请求一个实例时：
    *   获取该类的**主构造函数** (`primaryConstructor`)。
    *   获取构造函数的参数列表 (`parameters`)。
    *   递归地为每个参数类型请求实例（依赖解析）。
    *   使用 `constructor.callBy` 传入解析好的依赖实例。
    *   缓存实例（如果是 Singleton）。

```kotlin
class SimpleContainer {
    private val instances = mutableMapOf<KClass<*>, Any>()

    inline fun <reified T : Any> resolve(): T {
        val kClass = T::class
        if (instances.containsKey(kClass)) {
            return instances[kClass] as T
        }

        val constructor = kClass.primaryConstructor 
            ?: throw IllegalStateException("No primary constructor for $kClass")
        
        val args = mutableMapOf<KParameter, Any?>()
        for (param in constructor.parameters) {
            // 递归解析依赖
            val dependency = resolveDependency(param.type)
            args[param] = dependency
        }

        val instance = constructor.callBy(args)
        instances[kClass] = instance
        return instance as T
    }
    
    private fun resolveDependency(type: KType): Any? {
        val classifier = type.classifier as? KClass<*> ?: return null
        // 这里需要处理泛型、基本类型等复杂情况，简化起见仅演示思路
        return resolve(classifier) 
    }
    
    @Suppress("UNCHECKED_CAST")
    private fun <T : Any> resolve(kClass: KClass<T>): T {
        return resolve() // 实际实现需处理泛型映射
    }
}
```

### 6.4 测试框架支持

*   **Mocking**: Mockito 等库底层大量使用反射来创建代理对象和拦截方法调用。
*   **Fixture Generation**: 可以编写一个工具，根据 `KProperty` 的类型自动生成随机测试数据（例如遇到 `String` 生成随机串，遇到 `Int` 生成随机数）。

---

## 7. 性能考量与最佳实践

### 7.1 性能陷阱

1.  **启动慢**：首次加载 `kotlin-reflect` 和解析类元数据非常耗时。
2.  **调用慢**：`KFunction.call` 比直接调用慢几个数量级，因为它涉及装箱、参数映射和安全检查。
3.  **内存占用**：`KClass` 和相关的反射对象会占用 PermGen/Metaspace 空间。

### 7.2 优化策略

1.  **缓存一切**：
    *   不要每次都用 `::class.memberProperties`。
    *   建立一个 `ConcurrentHashMap<KClass, List<KProperty>>` 缓存属性列表。
    *   缓存 `KFunction` 实例。

2.  **避免在热点路径使用**：
    *   不要在高频循环中进行反射查找或调用。
    *   如果在循环中需要设置属性，考虑生成字节码（ByteBuddy）或使用 Java 反射的 `MethodHandle`（更快）。

3.  **使用 `call` 而非 `callBy`**：
    *   如果不需要默认参数支持，`call(vararg)` 比 `callBy(map)` 快，因为后者需要构建 Map 并匹配参数。

### 7.3 Kotlin 反射 vs Java 反射互操作

有时你需要混合使用：

```kotlin
val kProp = User::class.memberProperties.first()
// 获取对应的 Java Field
val javaField = (kProp as? KProperty1<*, *>)?.javaField
// 获取对应的 Java Getter
val javaGetter = kProp.javaGetter
```

**何时回退到 Java 反射？**
*   需要访问 `private` backing field 且不想破坏封装太严重（虽然两者都需要 `setAccessible(true)`）。
*   性能极度敏感的场景，Java 反射经过多年优化，且没有 Kotlin 层的额外抽象开销。
*   与纯 Java 库交互时。

### 7.4 替代方案：编译时处理

如果反射性能成为瓶颈，现代 Kotlin 开发倾向于**编译时代码生成**：

1.  **KSP (Kotlin Symbol Processing)**: 轻量级，专门用于 Kotlin。可以在编译期读取注解和符号，生成辅助代码（如 JSON 序列化适配器）。
2.  **KAPT**: 基于 Java annotation processing，较重，但生态成熟。
3.  **Compiler Plugins**: 最强大，可以直接修改 AST，但开发难度极高。

*例子*：`kotlinx.serialization` 不使用运行时反射，而是由编译器插件生成序列化代码，因此速度极快且支持 ProGuard/R8 混淆。

---

## 8. 常见误区与调试

1.  **内部类名称**：
    `Outer.Inner` 在 JVM 上的类名是 `Outer$Inner`。使用 `qualifiedName` 时 Kotlin 会显示 `Outer.Inner`，但在使用 `Class.forName` 时需要用 `$`。

2.  **Value Classes (Inline Classes)**：
    ```kotlin
    @JvmInline
    value class UserId(val id: Long)
    ```
    在反射中，`UserId::class` 的行为可能符合预期，但在底层 JVM 表示中，它可能被擦除为 `Long`。在跨边界调用（如传给 Java 方法）时需注意装箱。

3.  **Sealed Classes 的子类扫描**：
    `sealedSubclasses` 只返回**直接**子类。如果子类还有子类，需要递归查找。且确保所有子类都在同一个编译单元或类路径可见范围内。

4.  **异常处理**：
    反射调用抛出的异常通常被包裹在 `InvocationTargetException` 中。真正的异常在 `cause` 里。
    ```kotlin
    try {
        func.call(obj)
    } catch (e: InvocationTargetException) {
        throw e.cause ?: e
    }
    ```

---

## 9. 练习项目代码指引

### 练习 1: Mini JSON Parser (简化版)

```kotlin
import kotlin.reflect.full.memberProperties
import kotlin.reflect.KClass

fun Any.toJson(): String {
    val kClass = this::class
    val props = kClass.memberProperties
    val entries = props.joinToString(", ") { prop ->
        val value = prop.getter.call(this)
        val jsonString = when (value) {
            is String -> "\"$value\""
            null -> "null"
            else -> value.toString() // 简单处理，实际需递归
        }
        "\"${prop.name}\": $jsonString"
    }
    return "{$entries}"
}

// 测试
data class TestUser(val name: String, val age: Int)
fun main() {
    println(TestUser("Bob", 25).toJson()) 
    // 输出: {"name": "Bob", "age": 25}
}
```

### 练习 2: Simple DI Container (核心逻辑)

参考第 6.3 节。关键点在于递归解析 `primaryConstructor` 的参数。

### 练习 3: API Router

```kotlin
@Target(AnnotationTarget.FUNCTION)
annotation class Get(val path: String)

class Router {
    private val routes = mutableMapOf<String, KFunction<*>>()

    fun register(controller: Any) {
        val kClass = controller::class
        for (func in kClass.memberFunctions) {
            val getAnnotation = func.findAnnotation<Get>()
            if (getAnnotation != null) {
                routes[getAnnotation.path] = func
            }
        }
    }

    fun handle(path: String): String? {
        val func = routes[path] ?: return null
        // 假设函数无参且返回 String，实际需处理参数绑定
        return func.callBy(mapOf(func.parameters.firstOrNull { it.kind == KParameter.Kind.INSTANCE } to /* controller instance */)) as? String
    }
}
```

---

这是一份针对你提供的大纲的**详细讲解与代码实现指南**。我将深入每个知识点，提供可运行的代码示例、底层原理解析以及最佳实践建议。

---