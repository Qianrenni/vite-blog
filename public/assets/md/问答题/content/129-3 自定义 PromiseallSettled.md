### 3. 自定义 `Promise.allSettled()`

```javascript
function myPromiseAllSettled(promises) {
  return new Promise((resolve) => {
    if (!Array.isArray(promises)) {
      throw new TypeError('Argument must be an iterable');
    }

    const results = new Array(promises.length);
    let completed = 0;

    if (promises.length === 0) {
      resolve(results);
      return;
    }

    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(
          value => {
            results[index] = { status: 'fulfilled', value };
          },
          reason => {
            results[index] = { status: 'rejected', reason };
          }
        )
        .finally(() => {
          completed++;
          if (completed === promises.length) {
            resolve(results);
          }
        });
    });
  });
}
```

> **说明**：所有 Promise 都完成后才 resolve，结果包含每个 Promise 的状态和值/原因。

---