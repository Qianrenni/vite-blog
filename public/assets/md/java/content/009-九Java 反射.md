# **九、Java 反射**

反射（Reflection）是 Java 提供的一种强大的机制，允许程序在运行时动态地获取类的信息（如类名、方法、字段等），并操作对象的属性和方法。反射使得程序可以在编译时不知道类的具体信息的情况下，仍然能够进行操作。它在框架开发、动态代理、注解处理等场景中非常常见。

## **1. 反射的基本概念**

反射的核心是 `java.lang.reflect` 包，其中包含以下关键类：

- **Class**：表示类或接口的元数据。
- **Field**：表示类中的字段（成员变量）。
- **Method**：表示类中的方法。
- **Constructor**：表示类的构造方法。

通过反射，我们可以在运行时动态地加载类、创建对象、调用方法以及访问字段。

---

## **2. 获取 Class 对象**

要使用反射，首先需要获取目标类的 `Class` 对象。以下是几种常见的获取方式：

### **2.1 通过 `Class.forName()`**

```java
Class<?> clazz = Class.forName("java.util.ArrayList");
System.out.println(clazz.getName()); // 输出：java.util.ArrayList
```

### **2.2 通过 `.class` 属性**

```java
Class<?> clazz = ArrayList.class;
System.out.println(clazz.getName()); // 输出：java.util.ArrayList
```

### **2.3 通过对象的 `getClass()` 方法**

```java
ArrayList<String> list = new ArrayList<>();
Class<?> clazz = list.getClass();
System.out.println(clazz.getName()); // 输出：java.util.ArrayList
```

---

## **3. 创建对象**

通过反射可以动态创建对象，主要有两种方式：

### **3.1 使用无参构造方法**

```java
Class<?> clazz = Class.forName("java.util.Date");
Object obj = clazz.getDeclaredConstructor().newInstance();
System.out.println(obj); // 输出当前时间
```

### **3.2 使用带参构造方法**

```java
Class<?> clazz = Class.forName("java.lang.String");
Constructor<?> constructor = clazz.getConstructor(String.class);
Object obj = constructor.newInstance("Hello, Reflection!");
System.out.println(obj); // 输出：Hello, Reflection!
```

---

## **4. 访问字段**

反射可以访问类的私有字段，并对其进行读写操作。

### **4.1 获取字段**

```java
Class<?> clazz = Person.class;
Field field = clazz.getDeclaredField("name"); // 获取名为 "name" 的字段
field.setAccessible(true); // 绕过私有访问限制
```

### **4.2 设置和获取字段值**

```java
Person person = new Person();
Field field = Person.class.getDeclaredField("name");
field.setAccessible(true);

field.set(person, "Alice"); // 设置字段值
System.out.println(field.get(person)); // 输出：Alice
```

---

## **5. 调用方法**

反射可以动态调用类的方法。

### **5.1 获取方法**

```java
Class<?> clazz = Person.class;
Method method = clazz.getDeclaredMethod("sayHello", String.class); // 获取方法
method.setAccessible(true); // 如果方法是私有的
```

### **5.2 调用方法**

```java
Person person = new Person();
Method method = Person.class.getDeclaredMethod("sayHello", String.class);
method.setAccessible(true);

Object result = method.invoke(person, "Alice"); // 调用 sayHello 方法
System.out.println(result); // 输出：Hello, Alice
```

---

## **6. 处理注解**

反射可以用于读取类、方法或字段上的注解信息。

### **6.1 定义注解**

```java
import java.lang.annotation.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface MyAnnotation {
    String value();
}
```

### **6.2 使用注解**

```java
public class Person {
    @MyAnnotation("Hello")
    public void sayHello() {
        System.out.println("Hello!");
    }
}
```

### **6.3 获取注解信息**

```java
Class<?> clazz = Person.class;
Method method = clazz.getMethod("sayHello");
if (method.isAnnotationPresent(MyAnnotation.class)) {
    MyAnnotation annotation = method.getAnnotation(MyAnnotation.class);
    System.out.println(annotation.value()); // 输出：Hello
}
```

---

## **7. 动态代理**

动态代理是反射的一个重要应用场景，它允许我们为接口动态生成代理对象，并在调用方法时插入额外的逻辑。

### **7.1 定义接口和实现类**

```java
public interface Greeting {
    void sayHello(String name);
}

public class GreetingImpl implements Greeting {
    @Override
    public void sayHello(String name) {
        System.out.println("Hello, " + name);
    }
}
```

### **7.2 创建动态代理**

```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

public class ProxyExample {
    public static void main(String[] args) {
        Greeting greeting = new GreetingImpl();

        Greeting proxy = (Greeting) Proxy.newProxyInstance(
            greeting.getClass().getClassLoader(),
            greeting.getClass().getInterfaces(),
            new InvocationHandler() {
                @Override
                public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                    System.out.println("Before method call");
                    Object result = method.invoke(greeting, args);
                    System.out.println("After method call");
                    return result;
                }
            }
        );

        proxy.sayHello("Alice");
    }
}
```

输出结果：

```
Before method call
Hello, Alice
After method call
```

---

## **8. 反射的优缺点**

### **优点**

1. **灵活性高**：可以在运行时动态加载类、创建对象、调用方法。
2. **框架支持**：许多框架（如 Spring、Hibernate）依赖反射实现核心功能。
3. **扩展性强**：可以通过配置文件动态加载类，而无需修改代码。

### **缺点**

1. **性能开销**：反射操作比直接调用方法或访问字段慢。
2. **安全性问题**：反射可以绕过访问控制修饰符（如 private），可能导致安全隐患。
3. **可读性差**：反射代码通常较复杂，不易理解和维护。

## **总结**

- **反射的核心** 是 `java.lang.reflect` 包，包括 `Class`、`Field`、`Method` 和 `Constructor` 等类。
- **基本操作** 包括获取类信息、创建对象、访问字段、调用方法和处理注解。
- **动态代理** 是反射的重要应用，广泛用于 AOP（面向切面编程）。
- **优缺点分析** 表明反射虽然强大，但需要权衡性能和安全性。

---