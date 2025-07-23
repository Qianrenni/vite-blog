# **一、Java 基础知识**

## **1. Java 简介**

### **Java 的历史与特点**

Java 是一种广泛使用的面向对象的编程语言，由 Sun Microsystems 公司于1995年发布。它的设计初衷是让程序员能够“编写一次，到处运行”（Write Once, Run Anywhere），这意味着编译后的Java代码可以在所有支持Java的平台上运行，无需重新编译。这种跨平台能力是通过Java虚拟机（JVM）实现的。

#### **Java的主要特点**

- **面向对象**：Java的设计理念基于面向对象编程（OOP），它几乎所有的概念都围绕着类和对象展开。
- **跨平台性**：由于Java程序是在JVM上运行，而JVM可以在任何操作系统上运行，这使得Java具有良好的跨平台特性。
- **健壮性和安全性**：Java提供了自动垃圾收集机制来管理内存，减少了内存泄漏的可能性；同时，Java的安全模型帮助防止了许多安全漏洞。
- **多线程处理**：Java内置了对多线程的支持，允许并发执行多个任务，提高了程序的效率。
- **动态性**：Java可以适应不断发展的环境，库中可以自由添加新方法和实例变量而不会影响现有的代码。

- JDK、JRE 和 JVM 的区别

- **JDK (Java Development Kit)**：是Java开发工具包，包含了开发Java应用程序所需的一切：JRE（Java运行时环境）、编译器（javac）和其他工具（如用于打包Java应用程序的jar工具）。简单来说，如果你想要开发Java应用程序，你需要安装JDK。

- **JRE (Java Runtime Environment)**：是Java运行时环境，它是运行Java应用程序所需的最小设置。JRE包含了Java虚拟机（JVM）、核心类库和其他文件，但不包含开发工具（如编译器或调试器）。如果你仅需要运行Java程序而不是开发它们，那么只需要安装JRE即可。

- **JVM (Java Virtual Machine)**：是Java虚拟机，它是一个抽象的计算机，在实际的计算机上模拟运行字节码的机器。JVM是Java实现跨平台的关键部分，因为编译后的Java代码是一组字节码，这些字节码可以在任何实现了JVM的平台上运行。JVM负责加载、验证、执行字节码，并提供运行时环境。

#### **基本语法**

- 数据类型与变量
  - 基本数据类型（`int`, `double`, `char`, `boolean` 等）
  - 引用数据类型（类、数组、接口等）
- 运算符
  - 算术运算符、关系运算符、逻辑运算符、位运算符等
- 流程控制语句
  - 条件语句（`if`, `switch`）
  - 循环语句（`for`, `while`, `do-while`）
  - 跳转语句（`break`, `continue`, `return`）

### **数组**

#### **一维数组和多维数组的定义与使用**

- **一维数组**：最简单的数组形式，用于存储一组相同类型的元素。在Java中定义一个一维数组的基本语法如下：

  ```java
  数据类型[] 数组名 = new 数据类型[数组长度];
  // 或者直接初始化
  数据类型[] 数组名 = {值1, 值2, ...};
  ```

  例如，定义并初始化一个整数型的一维数组：

  ```java
  int[] numbers = {1, 2, 3, 4, 5};
  ```

- **多维数组**：可以看作是“数组的数组”，其中二维数组是最常用的多维数组。定义一个二维数组的方式如下：

  ```java
  数据类型[][] 数组名 = new 数据类型[行数][列数];
  // 或者直接初始化
  数据类型[][] 数组名 = {{值1, 值2}, {值3, 值4}};
  ```

  例如，定义并初始化一个二维整数数组：

  ```java
  int[][] matrix = {{1, 2, 3}, {4, 5, 6}};
  ```

#### **数组的遍历与常见操作（排序、查找等）**

- **数组的遍历**：可以通过for循环或增强型for循环来遍历数组中的元素。

  - 对于一维数组：

    ```java
    for(int i = 0; i < numbers.length; i++) {
        System.out.println(numbers[i]);
    }
    // 使用增强型for循环
    for(int num : numbers) {
        System.out.println(num);
    }
    ```
  
  - 对于二维数组：

    ```java
    for(int i = 0; i < matrix.length; i++) {
        for(int j = 0; j < matrix[i].length; j++) {
            System.out.print(matrix[i][j] + " ");
        }
        System.out.println();
    }
    ```

- **排序**：Java提供了`Arrays.sort()`方法对数组进行排序。它可以直接对一维数组进行升序排列，对于对象数组，则需要实现`Comparable`接口或提供`Comparator`。

  ```java
  import java.util.Arrays;
  
  Arrays.sort(numbers); // 对一维数组numbers进行排序
  ```

- **查找**：对于基本数据类型的数组，可以使用线性搜索或者二分搜索（如果数组已经排序）。Java提供的`Arrays.binarySearch()`方法可用于已排序数组的快速查找。

  ```java
  int index = Arrays.binarySearch(numbers, 3); // 查找数字3的位置
  ```

### **字符串**

在 Java 中，字符串是通过 `String` 类实现的。字符串是不可变的对象，同时提供了许多实用的方法来操作和处理文本数据。此外，Java 还提供了 `StringBuilder` 和 `StringBuffer` 用于高效地处理可变字符串。

---

#### **`String` 类的不可变性**

- **不可变性**：  
  在 Java 中，`String` 对象一旦被创建，其内容就不能被修改。任何对字符串的操作（如拼接、截取等）都会生成一个新的 `String` 对象，而不是修改原有的对象。这种设计有助于提高安全性、线程安全性和性能优化。

  ```java
  String str = "Hello";
  str.concat(" World"); // 不会改变原字符串
  System.out.println(str); // 输出 "Hello"
  ```

  如果需要保存修改后的结果，可以将新字符串赋值给一个变量：

  ```java
  String newStr = str.concat(" World");
  System.out.println(newStr); // 输出 "Hello World"
  ```

---

#### **常用方法**

`String` 类提供了许多常用的方法，以下是一些常见的操作：

1. **`substring(int beginIndex, int endIndex)`**  
   返回从 `beginIndex` 到 `endIndex-1` 的子字符串。

   ```java
   String str = "HelloWorld";
   String sub = str.substring(0, 5); // "Hello"
   ```

2. **`concat(String str)`**  
   将指定的字符串连接到当前字符串的末尾。

   ```java
   String str1 = "Hello";
   String str2 = str1.concat(" World"); // "Hello World"
   ```

3. **`equals(Object obj)`**  
   比较两个字符串的内容是否相等（区分大小写）。

   ```java
   String str1 = "hello";
   String str2 = "HELLO";
   System.out.println(str1.equals(str2)); // false
   ```

4. **`equalsIgnoreCase(String anotherString)`**  
   比较两个字符串的内容是否相等（忽略大小写）。

   ```java
   System.out.println(str1.equalsIgnoreCase(str2)); // true
   ```

5. **`indexOf(String str)`**  
   返回指定子字符串第一次出现的位置索引，如果不存在则返回 -1。

   ```java
   String str = "Hello World";
   int index = str.indexOf("World"); // 6
   ```

6. **`length()`**  
   返回字符串的长度（字符数）。

   ```java
   String str = "Hello";
   System.out.println(str.length()); // 5
   ```

7. **`replace(CharSequence target, CharSequence replacement)`**  
   将字符串中的某个子串替换为另一个子串。

   ```java
   String str = "Hello World";
   String replaced = str.replace("World", "Java"); // "Hello Java"
   ```

8. **`toLowerCase()` 和 `toUpperCase()`**  
   将字符串转换为小写或大写。

   ```java
   String str = "Hello World";
   System.out.println(str.toLowerCase()); // "hello world"
   System.out.println(str.toUpperCase()); // "HELLO WORLD"
   ```

9. **`trim()`**  
   去除字符串两端的空白字符（空格、制表符等）。

   ```java
   String str = "   Hello World   ";
   System.out.println(str.trim()); // "Hello World"
   ```

---

#### **`StringBuilder` 和 `StringBuffer` 的区别与使用**

由于 `String` 是不可变的，频繁地进行字符串拼接会导致大量临时对象的创建，影响性能。为此，Java 提供了 `StringBuilder` 和 `StringBuffer` 两种可变字符串类。

- **`StringBuilder`**  
  - **特点**：非线程安全，但性能更高。
  - **适用场景**：适用于单线程环境下的字符串操作。
  - **示例**：

    ```java
    StringBuilder sb = new StringBuilder();
    sb.append("Hello");
    sb.append(" ");
    sb.append("World");
    System.out.println(sb.toString()); // "Hello World"
    ```

- **`StringBuffer`**  
  - **特点**：线程安全，性能略低于 `StringBuilder`。
  - **适用场景**：适用于多线程环境下的字符串操作。
  - **示例**：

    ```java
    StringBuffer sb = new StringBuffer();
    sb.append("Hello");
    sb.append(" ");
    sb.append("World");
    System.out.println(sb.toString()); // "Hello World"
    ```

##### **两者的区别**

| 特性               | `StringBuilder`          | `StringBuffer`           |
|--------------------|--------------------------|--------------------------|
| 线程安全性         | 非线程安全               | 线程安全                 |
| 性能               | 更高                     | 略低                     |
| 适用场景           | 单线程环境               | 多线程环境               |

---