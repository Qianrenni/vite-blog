### 5. JavaScript (Node.js / 浏览器)

#### 原因分析：

- 闭包持有大对象
- 事件监听器未移除
- 频繁创建临时数组/对象

#### 应对策略：

- **避免内存泄漏**：
    - 及时移除事件监听器（removeEventListener）
    - 清理定时器（clearTimeout / clearInterval）

- **对象复用**：
    - 使用对象池（如 Three.js 中的 Vector3 池）
    - 避免在循环中创建函数/对象

- **监控与分析**：
    - Chrome DevTools Memory 面板
    - Node.js 使用 `--inspect` + Chrome DevTools
    - heapdump、clinic.js 等工具

---