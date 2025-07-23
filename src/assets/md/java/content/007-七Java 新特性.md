# **七、Java 新特性**

## **一、Java 8 及以后的新特性**

### **1. Lambda 表达式**

Lambda 表达式是 Java 8 中最重要的特性之一，它简化了匿名类的使用，使代码更加简洁和易读。Lambda 表达式用于实现函数式接口（只有一个抽象方法的接口）。

#### **语法：**

```java
(parameters) -> expression
```

#### **示例：**

```java
// 使用匿名类实现 Runnable 接口
Runnable r1 = new Runnable() {
    @Override
    public void run() {
        System.out.println("Hello, World!");
    }
};

// 使用 Lambda 表达式实现
Runnable r2 = () -> System.out.println("Hello, World!");

// 调用
r1.run(); // 输出: Hello, World!
r2.run(); // 输出: Hello, World!
```

#### **优势：**

- 减少样板代码。
- 提高代码可读性。
- 支持函数式编程风格。

---

### **2. 函数式接口（`@FunctionalInterface`）**

函数式接口是指仅包含一个抽象方法的接口。可以使用 `@FunctionalInterface` 注解来标记这样的接口。Lambda 表达式只能用于实现函数式接口。

#### **示例：**

```java
@FunctionalInterface
interface MyFunction {
    int apply(int a, int b);
}

public class Main {
    public static void main(String[] args) {
        // 使用 Lambda 表达式实现函数式接口
        MyFunction add = (a, b) -> a + b;
        System.out.println(add.apply(3, 5)); // 输出: 8
    }
}
```

#### **常见函数式接口：**

- `java.util.function.Function<T, R>`：将输入 T 转换为输出 R。
- `java.util.function.Consumer<T>`：对输入 T 执行操作，无返回值。
- `java.util.function.Predicate<T>`：判断条件是否满足，返回布尔值。
- `java.util.function.Supplier<T>`：提供一个 T 类型的结果。

---

### **3. Stream API**

Stream API 是 Java 8 引入的一个强大的工具，用于处理集合数据。它可以进行过滤、映射、归约等操作，并支持链式调用。

#### **核心概念：**

- **流（Stream）**：表示一系列元素的序列，支持聚合操作。
- **中间操作**：如 `filter`、`map`、`sorted`，返回新的流。
- **终端操作**：如 `forEach`、`collect`、`reduce`，触发实际计算并结束流。

#### **示例：**

```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");

// 过滤名字长度大于 3 的元素，并转换为大写
List<String> result = names.stream()
        .filter(name -> name.length() > 3)
        .map(String::toUpperCase)
        .collect(Collectors.toList());

System.out.println(result); // 输出: [ALICE, CHARLIE]
```

#### **优势：**

- 提供声明式编程风格。
- 支持并行流（`parallelStream`），提高性能。
- 简化集合操作。

---

### **4. 默认方法与静态方法在接口中的使用**

Java 8 允许在接口中定义默认方法和静态方法，避免修改现有实现类时破坏代码。

#### **默认方法：**

```java
interface MyInterface {
    default void sayHello() {
        System.out.println("Hello from default method!");
    }
}

class MyClass implements MyInterface {}

public class Main {
    public static void main(String[] args) {
        MyClass obj = new MyClass();
        obj.sayHello(); // 输出: Hello from default method!
    }
}
```

#### **静态方法：**

```java
interface MyInterface {
    static void sayHi() {
        System.out.println("Hi from static method!");
    }
}

public class Main {
    public static void main(String[] args) {
        MyInterface.sayHi(); // 输出: Hi from static method!
    }
}
```

#### **用途：**

- 向后兼容：在不破坏现有实现的情况下扩展接口功能。
- 提供通用方法实现。

---

### **5. Optional 类的使用**

`Optional` 是一个容器类，用于避免空指针异常（`NullPointerException`）。它表示一个值可能存在或不存在。

#### **常用方法：**

- `Optional.of(T value)`：创建非空的 Optional。
- `Optional.empty()`：创建空的 Optional。
- `isPresent()`：检查是否有值。
- `orElse(T other)`：如果为空，则返回指定值。
- `ifPresent(Consumer<? super T> consumer)`：如果存在值，则执行操作。

#### **示例：**

```java
Optional<String> optional = Optional.of("Hello");
optional.ifPresent(System.out::println); // 输出: Hello

Optional<String> empty = Optional.empty();
System.out.println(empty.orElse("Default Value")); // 输出: Default Value
```

#### **优势：**

- 明确表达可能为空的场景。
- 减少空指针异常的风险。

---

## **二、Java 9-17 的新特性**

### **1. 模块化系统（JPMS）**

Java 9 引入了模块化系统（Java Platform Module System, JPMS），通过 `module-info.java` 文件定义模块及其依赖关系，增强了项目的可维护性和安全性。

#### **示例：**

```java
// module-info.java
module com.example.myapp {
    requires java.sql; // 声明依赖
    exports com.example.myapp.api; // 导出包
}
```

#### **优势：**

- 提高封装性：模块间明确依赖关系。
- 减少运行时依赖冲突。
- 支持更小的运行时镜像。

---

### **2. var 关键字（局部变量类型推断）**

Java 10 引入了 `var` 关键字，允许编译器根据赋值自动推断局部变量的类型。

#### **示例：**

```java
var list = new ArrayList<String>(); // 编译器推断为 ArrayList<String>
list.add("Java");
System.out.println(list); // 输出: [Java]
```

#### **限制：**

- 仅适用于局部变量。
- 不适用于方法参数、字段或返回值。

#### **优势：**

- 简化代码，减少冗长的类型声明。

---

### **3. 新增的集合工厂方法**

Java 9 引入了 `List.of`、`Set.of` 和 `Map.of` 等工厂方法，用于快速创建不可变集合。

#### **示例：**

```java
List<String> list = List.of("A", "B", "C");
Set<Integer> set = Set.of(1, 2, 3);
Map<String, Integer> map = Map.of("Alice", 25, "Bob", 30);

System.out.println(list); // 输出: [A, B, C]
System.out.println(set);  // 输出: [1, 2, 3]
System.out.println(map);  // 输出: {Alice=25, Bob=30}
```

#### **特点：**

- 创建的集合是不可变的。
- 避免空指针异常（不允许包含 `null` 值）。

---

### **4. 文本块（Text Blocks）**

Java 15 引入了文本块（Text Blocks），用于简化多行字符串的书写。

#### **语法：**

```java
String json = """
{
    "name": "Alice",
    "age": 25
}
""";
System.out.println(json);
```

#### **优势：**

- 自动处理换行符和缩进。
- 提高代码可读性。

---

## **总结**

从 Java 8 到 Java 17，每个版本都引入了许多实用的新特性，极大地提升了开发效率和代码质量。以下是关键特性的总结：

- **Java 8**：Lambda 表达式、Stream API、Optional 类。
- **Java 9**：模块化系统、集合工厂方法。
- **Java 10**：`var` 关键字。
- **Java 15**：文本块。

这些新特性不仅使 Java 更加现代化，还为开发者提供了更多的灵活性和便利性。

---