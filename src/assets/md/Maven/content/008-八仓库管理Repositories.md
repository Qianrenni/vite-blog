# 🌐 八、仓库管理（Repositories）

Maven 默认使用 [Maven Central](https://repo1.maven.org/) 作为中央仓库。

你也可以添加其他仓库：

```xml
<repositories>
    <repository>
        <id>spring-releases</id>
        <url>https://repo.spring.io/release</url>
    </repository>
</repositories>
```

---