### 5. 自定义 `Promise.prototype.finally()`

```javascript
function myFinally(callback) {
  return this.then(
    value => Promise.resolve(callback()).then(() => value),
    reason => Promise.resolve(callback()).then(() => { throw reason; })
  );
}

// 使用方式（需绑定到 Promise.prototype）：
Promise.prototype.myFinally = myFinally;

// 或者作为独立函数使用：
function myPromiseFinally(promise, callback) {
  return promise.then(
    value => Promise.resolve(callback()).then(() => value),
    reason => Promise.resolve(callback()).then(() => { throw reason; })
  );
}
```

> **说明**：`finally` 不改变原 Promise 的状态和值，仅执行回调，且回调可能返回 Promise（需等待）。

---