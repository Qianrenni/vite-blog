### 三、JavaScript 执行优化

#### 1. 减少主线程阻塞

- 避免长任务（Long Tasks > 50ms）
- 使用 Web Worker 处理复杂计算
- 使用 `requestIdleCallback` 在空闲时执行低优先级任务

#### 2. 事件优化

- 事件委托（减少事件监听器数量）
- 防抖（Debounce）与节流（Throttle）优化高频事件（scroll/resize/input）
- 及时移除无用事件监听器（避免内存泄漏）

#### 3. 减少内存占用

- 及时解除引用（闭包、定时器、DOM 引用）
- 避免全局变量滥用
- 使用 WeakMap / WeakSet 管理对象引用
- 定期进行内存泄漏检测（Chrome DevTools Memory）

#### 4. 优化算法与数据结构

- 避免嵌套循环，使用 Map/Set 提高查找效率
- 大数据分片处理（setTimeout 分帧）

---