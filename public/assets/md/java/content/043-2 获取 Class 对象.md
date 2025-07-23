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