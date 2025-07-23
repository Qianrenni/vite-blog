# 🔌 七、Maven 插件（Plugins）

Maven 支持大量插件来增强构建能力。

## 常见插件

| 插件名称 | 功能 |
|----------|------|
| `maven-compiler-plugin` | 设置 Java 版本 |
| `maven-surefire-plugin` | 控制单元测试执行 |
| `maven-failsafe-plugin` | 控制集成测试执行 |
| `maven-jar-plugin` | 控制 JAR 包生成方式 |
| `maven-shade-plugin` | 打包包含依赖的“胖”JAR |
| `spring-boot-maven-plugin` | Spring Boot 项目打包部署 |

## 示例：设置 Java 17 编译

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.8.1</version>
            <configuration>
                <source>17</source>
                <target>17</target>
            </configuration>
        </plugin>
    </plugins>
</build>
```

---