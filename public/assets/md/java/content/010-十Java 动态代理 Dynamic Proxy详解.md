# **十、Java 动态代理 （Dynamic Proxy）详解**

Java 动态代理是一种**运行时动态生成代理类的技术**，它是 Java 反射机制的一部分。通过动态代理，我们可以在不修改目标对象的前提下，对目标对象的方法进行增强或拦截，是 AOP（面向切面编程）的基础。

## **📌 1、什么是动态代理？**

### 定义

动态代理是指在程序运行过程中，根据传入的真实对象（被代理对象），**动态创建一个代理对象**，并用这个代理对象来代替真实对象完成操作。

### 核心作用

- **在不修改目标对象的前提下，对方法进行功能增强**
- **实现解耦，提高代码的可扩展性和灵活性**
- **AOP（如 Spring AOP）底层实现原理**

---

## **🧱 2、核心 API 和类**

| 类/接口 | 说明 |
|--------|------|
| `java.lang.reflect.Proxy` | 核心类，用于生成代理对象 |
| `java.lang.reflect.InvocationHandler` | 接口，用于定义代理逻辑 |
| `java.lang.reflect.Method` | 表示被调用的方法对象 |

---

## **🛠️ 3、动态代理的使用步骤**

### ✅ 步骤 1：定义接口（必须）

```java
public interface UserService {
    void addUser();
    void deleteUser();
}
```

> ⚠️ 注意：Java 动态代理只能对接口进行代理！

---

### ✅ 步骤 2：实现接口类（真实对象）

```java
public class UserServiceImpl implements UserService {
    @Override
    public void addUser() {
        System.out.println("添加用户");
    }

    @Override
    public void deleteUser() {
        System.out.println("删除用户");
    }
}
```

---

### ✅ 步骤 3：实现 InvocationHandler 接口（定义代理逻辑）

```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

public class MyInvocationHandler implements InvocationHandler {

    private Object target; // 被代理的对象

    public MyInvocationHandler(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("【前置增强】方法执行前：" + method.getName());

        // 执行真实对象的方法
        Object result = method.invoke(target, args);

        System.out.println("【后置增强】方法执行后：" + method.getName());
        return result;
    }
}
```

---

### ✅ 步骤 4：生成代理对象并调用

```java
import java.lang.reflect.Proxy;

public class TestProxy {
    public static void main(String[] args) {
        // 创建真实对象
        UserService userService = new UserServiceImpl();

        // 创建代理处理器
        MyInvocationHandler handler = new MyInvocationHandler(userService);

        // 生成代理对象
        UserService proxy = (UserService) Proxy.newProxyInstance(
                userService.getClass().getClassLoader(),   // 类加载器
                userService.getClass().getInterfaces(),   // 被代理对象实现的接口
                handler                                   // 代理逻辑处理器
        );

        // 调用代理对象的方法
        proxy.addUser();
        proxy.deleteUser();
    }
}
```

---

## 📈 4、输出结果

```
【前置增强】方法执行前：addUser
添加用户
【后置增强】方法执行后：addUser

【前置增强】方法执行前：deleteUser
删除用户
【后置增强】方法执行后：deleteUser
```

---

## 🔄 5、与静态代理的区别

| 特点 | 静态代理 | 动态代理 |
|------|----------|-----------|
| 代理类是否手动编写 | 是 | 否 |
| 是否支持多个接口 | 否 | 是 |
| 是否灵活 | 不灵活 | 灵活 |
| 实现复杂度 | 简单 | 复杂 |
| 性能 | 略高 | 略低（但差距不大） |

---

## 🔐 6、应用场景

| 应用场景 | 说明 |
|----------|------|
| 日志记录 | 在方法执行前后记录日志 |
| 权限控制 | 控制某些方法是否可以被调用 |
| 性能监控 | 统计方法执行时间 |
| 事务管理 | 在方法执行前后开启和提交事务 |
| AOP 编程 | Spring 框架中大量使用动态代理做切面处理 |

---

## 🧩 7、Spring 中的 AOP 与动态代理的关系

Spring AOP 默认使用 JDK 动态代理（基于接口），但如果目标类没有实现接口，则会使用 **CGLIB**（继承方式实现代理）。

> ✅ 如果你希望强制使用 CGLIB 代理，可以在配置中设置：

```xml
<aop:config proxy-target-class="true"/>
```

---

## 📎 8、动态代理的局限性

- **只能代理接口方法**（JDK 原生动态代理）
- **不能代理类方法**（除非使用 CGLIB 或 Javassist 等第三方库）
- **性能略低于直接调用**（但一般影响不大）
- **调试较困难**（因为代理类是运行时生成的）

---

## 🧪 9、完整代码汇总

### 1. 接口定义

```java
public interface UserService {
    void addUser();
    void deleteUser();
}
```

### 2. 实现类

```java
public class UserServiceImpl implements UserService {
    @Override
    public void addUser() {
        System.out.println("添加用户");
    }

    @Override
    public void deleteUser() {
        System.out.println("删除用户");
    }
}
```

### 3. 代理处理器

```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

public class MyInvocationHandler implements InvocationHandler {
    private Object target;

    public MyInvocationHandler(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("【前置增强】方法执行前：" + method.getName());
        Object result = method.invoke(target, args);
        System.out.println("【后置增强】方法执行后：" + method.getName());
        return result;
    }
}
```

### 4. 测试类

```java
import java.lang.reflect.Proxy;

public class TestProxy {
    public static void main(String[] args) {
        UserService userService = new UserServiceImpl();
        MyInvocationHandler handler = new MyInvocationHandler(userService);
        UserService proxy = (UserService) Proxy.newProxyInstance(
            userService.getClass().getClassLoader(),
            userService.getClass().getInterfaces(),
            handler
        );
        proxy.addUser();
        proxy.deleteUser();
    }
}
```

---

## 🧠 10、总结

| 项目 | 内容 |
|------|------|
| 动态代理 | 运行时生成代理类，用于增强方法 |
| 核心类 | `Proxy`, `InvocationHandler` |
| 必须条件 | 被代理类必须实现接口 |
| 使用场景 | 日志、权限、事务、AOP |
| 优点 | 解耦、灵活、易于扩展 |
| 缺点 | 只能代理接口方法，调试困难 |