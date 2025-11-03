### 3. **Reflect 保证行为一致性**
`Reflect` 是 ES6 提供的内置对象，用于操作对象属性，其方法与 `Proxy` 拦截器一一对应。

在 `Proxy` 的 `get`/`set` 等 handler 中使用 `Reflect.get(target, key, receiver)` 而不是 `target[key]`，有以下好处：
- **保持默认行为一致**：比如属性的 `this` 指向、getter/setter 的调用上下文等。
- **避免手动实现逻辑出错**：`Reflect` 是语言内置的标准行为。
- **支持 `receiver` 参数**：确保在继承链或嵌套代理中，`this` 正确指向代理对象而非原始对象。

示例：
```js
const reactive = (target) => {
  return new Proxy(target, {
    get(target, key, receiver) {
      // track 依赖收集
      track(target, key);
      // 使用 Reflect 保证行为正确
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      // trigger 触发更新
      trigger(target, key);
      return result;
    }
  });
};
```

---