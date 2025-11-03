### 5. **`setTimeout(fn, 0)` 与 `setImmediate` 的执行顺序**
- **在 Node.js 的 I/O 回调中**：
  - `setImmediate` **先于** `setTimeout(fn, 0)` 执行（因为 Poll → Check → 下一轮 Timers）。
- **在浏览器中**：
  - 只有 `setTimeout(fn, 0)`，会被加入宏任务队列，按顺序执行。

---