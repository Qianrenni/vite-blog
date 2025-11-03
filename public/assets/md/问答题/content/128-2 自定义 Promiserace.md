### 2. 自定义 `Promise.race()`

```javascript
function myPromiseRace(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an iterable'));
    }

    if (promises.length === 0) {
      // 永不 settle（与原生行为一致）
      return;
    }

    for (const promise of promises) {
      Promise.resolve(promise).then(resolve, reject);
    }
  });
}
```

> **说明**：第一个 settle（fulfilled 或 rejected）的 Promise 决定结果。

---