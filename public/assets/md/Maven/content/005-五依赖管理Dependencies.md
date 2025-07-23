# 🔗 五、依赖管理（Dependencies）

Maven 会自动从远程仓库下载所需的依赖，并处理其传递依赖。

## 示例

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <version>3.1.0</version>
</dependency>
```

## 常用 `<scope>` 类型

| scope | 说明 |
|-------|------|
| `compile` | 默认值，适用于所有阶段 |
| `provided` | 编译时需要，运行时由容器提供（如 Servlet API） |
| `runtime` | 运行和测试时需要，编译不需要 |
| `test` | 只在测试阶段可用（如 JUnit） |
| `system` | 自定义本地依赖（不推荐） |

---