# Gradle (build.gradle.kts)

## 1. 基础结构与初始化

### 1.1 `build.gradle.kts` vs `build.gradle`
*   **本质区别**：
    *   `.gradle` (Groovy): 动态语言，运行时解析。语法灵活但缺乏静态检查，IDE 自动补全较弱，重构困难。
    *   `.kts` (Kotlin): 静态类型语言，编译时解析。**强类型安全**意味着如果在配置中写错属性名或类型，IDE 会立即报错，而不是在构建失败时才暴露。
*   **语法迁移关键点**：
    *   Groovy: `apply plugin: 'java'` -> Kotlin: `plugins { id("java") }`
    *   Groovy: `dependencies { compile 'group:name:version' }` -> Kotlin: `dependencies { implementation("group:name:version") }`
    *   Groovy: 字符串常用单引号 `'` -> Kotlin: 必须使用双引号 `"` 或三引号 `"""`。

### 1.2 项目基本信息配置
这三个属性定义了项目的坐标（Coordinates），在发布到 Maven 仓库时至关重要。

```kotlin
// group: 组织标识，通常反向域名
group = "com.example.myapp"

// version: 项目版本。SNAPSHOT 表示开发中版本，Release 表示稳定版
version = "1.0.0-SNAPSHOT"

// description: 项目描述，会出现在生成的 POM 文件中
description = "A high-performance Kotlin service"
```

> **最佳实践**：在多模块项目中，通常在根目录的 `build.gradle.kts` 中统一设置 `group` 和 `version`，子模块会自动继承，除非子模块显式覆盖。

### 1.3 Java/Kotlin 版本兼容性
确保编译器目标字节码版本与运行环境一致。

**方式一：通过 Java Extension (传统)**
```kotlin
java {
    // 源代码兼容级别
    sourceCompatibility = JavaVersion.VERSION_17
    // 生成的字节码兼容级别
    targetCompatibility = JavaVersion.VERSION_17
}
```

**方式二：通过 JVM Toolchains (推荐 - Gradle 6.7+)**
Toolchains 允许 Gradle 自动下载和管理指定版本的 JDK，即使本地环境变量指向的是其他版本。这解决了“开发者本地 JDK 版本不一致”导致的构建问题。

```kotlin
kotlin {
    // 告诉 Gradle：我需要 JDK 17 来编译和运行这个项目
    jvmToolchain(17)
}
```

---

## 2. 插件管理 (Plugins)

### 2.1 `plugins {}` 块（声明式插件）
这是应用插件的首选方式。Gradle 会在配置阶段早期解析此块，以便正确隔离类路径。

```kotlin
plugins {
    // Kotlin 官方插件快捷写法
    kotlin("jvm") version "1.9.20"
    
    // 社区/第三方插件标准写法
    id("org.springframework.boot") version "3.2.0"
    id("io.spring.dependency-management") version "1.1.4"
}
```

**结合 Version Catalogs (版本目录)**：
为了避免硬编码版本号，现代 Gradle 项目推荐使用 `libs.versions.toml`。

```kotlin
// build.gradle.kts
plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.spring.boot)
}
```

### 2.2 传统 `apply()` 方法（命令式插件）
仅用于**脚本插件**（Script Plugins）或某些无法在 `plugins {}` 块中应用的旧插件。

```kotlin
// 应用一个本地脚本插件
apply(from = "config/quality.gradle.kts")

// 应用一个 ID（不推荐，除非必要）
apply(plugin = "java-library")
```
> **注意**：`apply()` 应用的插件无法享受 `plugins {}` 块的优化（如配置缓存的部分支持），且容易导致类路径污染。

### 2.3 常用 Kotlin 相关插件详解
*   **`kotlin("jvm")`**: 基础插件，提供 `compileKotlin` 任务。
*   **`kotlin("plugin.serialization")`**: 启用 `@Serializable` 注解支持。需配合依赖 `implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:...")`。
*   **`kotlin("plugin.allopen")`**: **Spring 必备**。Spring AOP 需要类是非 final 的，而 Kotlin 类默认是 `final`。此插件将所有类开放为 non-final，或者仅开放带有特定注解（如 `@Component`）的类。
    ```kotlin
    allOpen {
        annotation("org.springframework.stereotype.Component")
        annotation("org.springframework.transaction.annotation.Transactional")
    }
    ```
*   **`kotlin("plugin.noarg")`**: **JPA/Hibernate 必备**。为带有特定注解的类生成无参构造函数。

---

## 3. 依赖管理 (Dependencies)

### 3.1 依赖配置项 (Configurations) 深度解析
理解依赖范围是解决 `ClassNotFoundException` 和 `NoSuchMethodError` 的关键。

| 配置项 | 编译时可见 | 运行时可见 | 传递给依赖我的项目? | 典型场景 |
| :--- | :---: | :---: | :---: | :--- |
| `implementation` | ✅ | ✅ | ❌ | 内部实现细节，不希望暴露 API |
| `api` | ✅ | ✅ | ✅ | 库项目的公开 API 接口 |
| `compileOnly` | ✅ | ❌ | ❌ | Lombok, Servlet API (由容器提供) |
| `runtimeOnly` | ❌ | ✅ | ❌ | JDBC 驱动, 日志实现 (SLF4J binding) |
| `testImplementation` | ✅ (测试) | ✅ (测试) | ❌ | JUnit, Mockito |

> **核心原则**：优先使用 `implementation`。只有当你希望下游项目直接使用你依赖中的类时，才使用 `api`。这能显著减少重新编译的时间（Gradle 增量编译优势）。

### 3.2 添加依赖的标准写法
```kotlin
dependencies {
    // 1. Kotlin 标准库 (通常由插件自动添加，但可显式声明)
    implementation(kotlin("stdlib"))
    
    // 2. 外部库: "group:name:version"
    implementation("com.google.guava:guava:32.1.3-jre")
    
    // 3. 项目间依赖 (多模块)
    implementation(project(":common-module"))
    
    // 4. 文件依赖 (本地 jar)
    implementation(files("libs/local-lib.jar"))
}
```

### 3.3 版本目录 (Version Catalogs) - 现代最佳实践
在 `gradle/libs.versions.toml` 文件中集中管理依赖。

**`gradle/libs.versions.toml` 示例：**
```toml
[versions]
kotlin = "1.9.20"
coroutines = "1.7.3"
junit = "5.10.0"

[libraries]
kotlin-stdlib = { module = "org.jetbrains.kotlin:kotlin-stdlib", version.ref = "kotlin" }
coroutines-core = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-core", version.ref = "coroutines" }
junit-jupiter = { module = "org.junit.jupiter:junit-jupiter", version.ref = "junit" }

[bundles]
testing = ["junit-jupiter", "mockito-core"] # 组合依赖

[plugins]
kotlin-jvm = { id = "org.jetbrains.kotlin.jvm", version.ref = "kotlin" }
```

**在 `build.gradle.kts` 中使用：**
```kotlin
dependencies {
    implementation(libs.kotlin.stdlib)
    implementation(libs.coroutines.core)
    testImplementation(libs.bundles.testing)
}
```
> **优势**：类型安全访问（IDE 有补全），单一事实来源（Single Source of Truth），易于跨模块共享版本。

### 3.4 平台依赖与 BOM
BOM (Bill of Materials) 是一组协调版本的依赖列表。

```kotlin
dependencies {
    // 导入 Spring Boot 的 BOM
    implementation(platform("org.springframework.boot:spring-boot-dependencies:3.2.0"))
    
    // 现在添加 Spring 组件时，无需指定版本，BOM 会自动管理
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
}
```

---

## 4. 仓库管理 (Repositories)

### 4.1 常见仓库配置
Gradle 按顺序查找依赖。建议将最常用的仓库放在前面以提高解析速度。

```kotlin
repositories {
    mavenCentral() // 首选，全球镜像多
    
    // 如果需要 Google 库 (Android, Firebase 等)
    google()
    
    // 本地 Maven 缓存 (~/.m2/repository)，用于调试本地发布的库
    mavenLocal()
    
    // 私有 Nexus/Artifactory
    maven("https://repo.mycompany.com/releases") {
        name = "MyCompanyRepo"
        credentials {
            username = project.findProperty("nexusUser") as String? ?: ""
            password = project.findProperty("nexusPassword") as String? ?: ""
        }
    }
}
```

### 4.2 敏感信息处理
**永远不要**将密码硬编码在 `build.gradle.kts` 中并提交到 Git。
1.  **环境变量**：`System.getenv("NEXUS_PASSWORD")`
2.  **Gradle Properties**：在 `~/.gradle/gradle.properties` 中定义，或在 CI/CD 环境中注入。
3.  **Credentials Plugin**：使用 Gradle 内置的安全凭证处理。

---

## 5. 任务定制 (Tasks)

### 5.1 注册自定义任务
使用 `tasks.register` 是懒配置（Lazy Configuration）的最佳实践，只有在任务被请求执行时才会配置它，提升构建性能。

```kotlin
// 创建一个复制配置文件的任务
tasks.register<Copy>("copyProdConfig") {
    group = "build" // 在 gradle tasks 中显示的分组
    description = "Copies production config files to build directory"
    
    from("src/main/resources/prod")
    into("$buildDir/config")
    
    // 只有当输入文件变化时才执行
    inputs.dir("src/main/resources/prod")
    outputs.dir("$buildDir/config")
}
```

### 5.2 配置现有任务
使用 `tasks.named` 或 `tasks.withType` 来配置由插件创建的任务。

**配置 Jar 包 Manifest：**
```kotlin
tasks.jar {
    manifest {
        attributes(
            "Implementation-Title" to project.name,
            "Implementation-Version" to project.version,
            "Main-Class" to "com.example.ApplicationKt"
        )
    }
    
    // 打包依赖到一个胖 Jar (Fat Jar) - 简单做法，生产环境建议用 Shadow 插件
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
    from(configurations.runtimeClasspath.get().map { if (it.isDirectory) it else zipTree(it) })
}
```

**配置测试任务：**
```kotlin
tasks.test {
    useJUnitPlatform() // 启用 JUnit 5
    
    // 传递系统属性给测试进程
    systemProperty("my.config.path", "/tmp/test-config")
    
    // 增加测试堆内存
    maxHeapSize = "2G"
    
    // 显示测试日志
    testLogging {
        events("passed", "skipped", "failed")
        showStandardStreams = true
    }
}
```

### 5.3 任务依赖链
```kotlin
// 在运行 app 之前，先执行 copyProdConfig
tasks.named("run") {
    dependsOn("copyProdConfig")
}

// 在构建完成后，清理一些临时文件
tasks.build {
    finalizedBy("cleanupTempFiles")
}
```

---

## 6. 多模块项目 (Multi-module Projects)

### 6.1 `settings.gradle.kts` 结构
```kotlin
rootProject.name = "microservices-platform"

// 包含子模块
include("api-gateway")
include("user-service")
include("common-lib")
include("integration-tests")

// 可选：重命名项目路径映射
project(":user-service").projectDir = file("services/user")
```

### 6.2 模块间依赖
在 `user-service/build.gradle.kts` 中：
```kotlin
dependencies {
    // 依赖 common-lib 模块
    implementation(project(":common-lib"))
    
    // 如果只需要测试时依赖
    testImplementation(project(":common-test-utils"))
}
```

### 6.3 共享配置 (Convention Plugins)
避免在每个 `build.gradle.kts` 中重复编写相同的 Kotlin 配置、依赖版本等。

**方案 A: `buildSrc` (简单项目)**
在根目录创建 `buildSrc/src/main/kotlin/my-conventions.gradle.kts`。
```kotlin
// buildSrc/src/main/kotlin/my-conventions.gradle.kts
plugins {
    kotlin("jvm")
}

kotlin {
    jvmToolchain(17)
}

dependencies {
    implementation(libs.kotlin.stdlib) // 这里可以使用 libs 吗？需要特殊配置
}
```
然后在子模块中：`plugins { id("my-conventions") }`

**方案 B: 独立的 Convention 插件模块 (大型项目推荐)**
创建一个单独的 Gradle 项目（如 `build-logic`），发布为插件，供主项目引用。这种方式更干净，支持更好的隔离和测试。

---

## 7. Kotlin 特定配置

### 7.1 编译器选项
```kotlin
kotlin {
    compilerOptions {
        // 严格处理 JSR-305 注解 (@Nullable, @Nonnull)
        freeCompilerArgs.add("-Xjsr305=strict")
        
        // 允许使用实验性 API
        freeCompilerArgs.add("-opt-in=kotlinx.coroutines.ExperimentalCoroutinesApi")
        
        // 将警告视为错误 (CI 环境中非常有用)
        allWarningsAsErrors.set(true)
        
        // 启用渐进式模式 (提前体验新特性，可能有风险)
        progressiveMode.set(true)
    }
}
```

### 7.2 源集配置 (Source Sets)
默认源集是 `main` 和 `test`。你可以添加自定义源集，例如用于集成测试。

```kotlin
sourceSets {
    create("integrationTest") {
        kotlin.srcDir("src/integrationTest/kotlin")
        resources.srcDir("src/integrationTest/resources")
        compileClasspath += sourceSets.main.get().output + configurations.testRuntimeClasspath.get()
        runtimeClasspath += output + compileClasspath
    }
}

// 为集成测试添加依赖
dependencies {
    "integrationTestImplementation"(project(":common-test-utils"))
    "integrationTestRuntimeOnly"(libs.h2.database)
}

// 注册集成测试任务
tasks.register<Test>("integrationTest") {
    description = "Runs integration tests."
    group = "verification"
    testClassesDirs = sourceSets["integrationTest"].output.classesDirs
    classpath = sourceSets["integrationTest"].runtimeClasspath
    shouldRunAfter(tasks.test)
}
```

---

## 8. 高级主题与性能优化

### 8.1 构建扫描 (Build Scans)
在 `settings.gradle.kts` 中启用：
```kotlin
plugins {
    id("com.gradle.develocity") version "3.15" // 或旧版 com.gradle.enterprise
}

develocity {
    buildScan {
        termsOfUseUrl = "https://gradle.com/terms-of-service"
        termsOfUseAgree = "yes"
        publishing.onlyIf { it.buildResult.failures.isNotEmpty() } // 仅失败时上传
    }
}
```
运行后，Gradle 会提供一个 URL，展示详细的依赖解析时间、任务执行耗时图谱，是优化构建速度的神器。

### 8.2 配置缓存 (Configuration Cache)
Gradle 7.4+ 稳定特性。跳过配置阶段，直接重用上次构建的任务图。
在 `gradle.properties` 中启用：
```properties
org.gradle.configuration-cache=true
```
**注意**：你的构建脚本必须是“配置缓存兼容”的。这意味着不能在配置阶段执行 I/O 操作、网络请求或访问未声明的项目属性。如果构建失败，Gradle 会明确指出哪个任务破坏了缓存。

### 8.3 并行构建
```properties
# gradle.properties
org.gradle.parallel=true
org.gradle.caching=true
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=1g
```

### 8.4 依赖冲突解决
当不同依赖引入了同一库的不同版本时：
```kotlin
configurations.all {
    resolutionStrategy {
        // 强制使用特定版本
        force("com.google.guava:guava:32.1.3-jre")
        
        // 排除特定模块
        exclude(group = "log4j", module = "log4j")
        
        // 失败策略：如果有冲突则构建失败，而不是悄悄选择最新版本
        failOnVersionConflict()
    }
}
```
使用 `./gradlew dependencies --configuration runtimeClasspath` 查看依赖树，定位冲突。

---

## 9. 常见问题与调试

1.  **IDE 索引慢/红波浪线**：
    *   点击 IntelliJ IDEA 右侧 Gradle 面板的 "Reload All Gradle Projects"。
    *   如果无效：`File` -> `Invalidate Caches / Restart`。
    *   确保 IDE 使用的 Gradle JVM 版本与项目要求的 Toolchain 一致。

2.  **`Could not resolve ...`**：
    *   检查网络连接。
    *   检查 `repositories` 是否包含了该库所在的仓库。
    *   检查版本号是否拼写正确。

3.  **Kotlin DSL 脚本编译错误**：
    *   Kotlin DSL 脚本本身也是 Kotlin 代码，会被编译。如果语法错误，IDE 会提示。
    *   有时 Gradle 守护进程状态异常，运行 `./gradlew --stop` 重启守护进程。

4.  **查看依赖树**：
    ```bash
    ./gradlew dependencies
    ./gradlew :module-name:dependencies --configuration runtimeClasspath
    ```

---

### 标准模板 (`build.gradle.kts`)

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    kotlin("jvm") version "1.9.20"
    application
    // 如果使用 Spring:
    // id("org.springframework.boot") version "3.2.0"
    // id("io.spring.dependency-management") version "1.1.4"
}

group = "com.example"
version = "1.0.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    // Kotlin Stdlib
    implementation(kotlin("stdlib"))
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    
    // Logging
    implementation("org.slf4j:slf4j-api:2.0.9")
    runtimeOnly("ch.qos.logback:logback-classic:1.4.11")
    
    // Testing
    testImplementation(kotlin("test"))
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")
}

// Kotlin 配置
kotlin {
    jvmToolchain(17)
    
    compilerOptions {
        freeCompilerArgs.addAll(
            "-Xjsr305=strict",
            "-opt-in=kotlin.RequiresOptIn"
        )
    }
}

// Application 插件配置
application {
    mainClass.set("com.example.MainKt")
}

// 测试配置
tasks.test {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")
    }
}

// Jar 包配置
tasks.jar {
    manifest {
        attributes["Main-Class"] = application.mainClass.get()
    }
}
```