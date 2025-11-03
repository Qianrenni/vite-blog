### 五、Node.js 中的事件循环（补充）

Node.js 的事件循环基于 **libuv**，分为 6 个阶段：

1. **timers**：执行 `setTimeout`、`setInterval` 回调
2. **pending callbacks**：执行系统操作回调（如 TCP 错误）
3. **idle, prepare**：内部使用
4. **poll**：获取新 I/O 事件，执行 I/O 回调；**Node 大部分时间在此**
5. **check**：执行 `setImmediate` 回调
6. **close callbacks**：如 `socket.on('close', ...)`

> 🔄 每个阶段之间会检查**微任务队列**（包括 `process.nextTick` 和 `Promise`）。

#### Node.js 特殊行为：

```js
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));

// 输出不确定！可能 'timeout' 或 'immediate'
// 因为 timers 阶段是否进入取决于准备时间
```

但：

```js
fs.readFile('file.txt', () => {
    setTimeout(() => console.log('timeout'), 0);
    setImmediate(() => console.log('immediate'));
});
// 一定输出 'immediate' → 因为在 poll 阶段后进入 check 阶段
```

---