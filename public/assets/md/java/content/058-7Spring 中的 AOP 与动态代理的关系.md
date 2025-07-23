## 🧩 7、Spring 中的 AOP 与动态代理的关系

Spring AOP 默认使用 JDK 动态代理（基于接口），但如果目标类没有实现接口，则会使用 **CGLIB**（继承方式实现代理）。

> ✅ 如果你希望强制使用 CGLIB 代理，可以在配置中设置：

```xml
<aop:config proxy-target-class="true"/>
```

---