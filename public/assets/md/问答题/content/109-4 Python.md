### 4. Python

#### 原因分析：

- CPython 使用引用计数 + 分代 GC
- 循环引用导致分代 GC 触发频繁
- 大量临时对象（如列表推导式、字符串拼接）

#### 应对策略：

- **减少对象创建**：
    - 使用生成器（generator）代替列表
    - 字符串拼接用 `''.join()` 而非 `+`
    - 重用字典/列表（清空而非重建）

- **手动管理循环引用**：
    - 使用 `weakref` 避免强引用循环
    - 定期调用 `gc.collect()`（谨慎使用）

- **禁用或调优 GC**（仅在特定场景）：
  ```python
  import gc
  gc.disable()  # 不推荐，除非明确知道无循环引用
  gc.set_threshold(700, 10, 10)  # 调整分代阈值
  ```

- **使用内存分析工具**：
    - `tracemalloc`、`objgraph`、`memory_profiler`

---