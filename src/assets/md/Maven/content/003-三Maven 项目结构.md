# 📁 三、Maven 项目结构

Maven 遵循约定优于配置的原则，提供了一套标准的目录结构：

```
my-project/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/       # Java 源代码
│   │   └── resources/  # 资源文件（如配置文件）
│   └── test/
│       ├── java/       # 测试代码
│       └── resources/  # 测试资源文件
└── target/             # 构建输出目录（自动生成）
```

---