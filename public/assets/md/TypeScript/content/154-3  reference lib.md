## 3. /// <reference lib="..." />

用于显式包含内置的 TypeScript 库定义文件。

### 常用库引用

```typescript
// ES2015 特性
/// <reference lib="es2015" />

// DOM API
/// <reference lib="dom" />

// Web Workers
/// <reference lib="webworker" />

// ESNext
/// <reference lib="esnext" />
```

### 实际应用示例

```typescript
// webworker.ts
/// <reference lib="webworker" />

// 现在可以使用 Web Worker 的全局变量和类型
self.addEventListener('message', (event: MessageEvent) => {
    const data = event.data;
    // 处理数据
    self.postMessage({ result: 'processed' });
});

// service-worker.ts
/// <reference lib="webworker" />
/// <reference lib="scripthost" />

self.addEventListener('fetch', (event: FetchEvent) => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
```

### 组合使用多个库

```typescript
// modern-browser.ts
/// <reference lib="es2020" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

// 现在可以使用现代 JavaScript 和 DOM API
const array = [1, 2, 3, 4, 5];
const iterator = array[Symbol.iterator]();

// 使用 DOM API
const element = document.querySelector('.my-class');
if (element) {
    element.classList.add('active');
}
```

### TypeScript 内置库列表

```typescript
// ES 标准库
/// <reference lib="es5" />
/// <reference lib="es2015" />
/// <reference lib="es2016" />
/// <reference lib="es2017" />
/// <reference lib="es2018" />
/// <reference lib="es2019" />
/// <reference lib="es2020" />
/// <reference lib="es2021" />
/// <reference lib="es2022" />
/// <reference lib="esnext" />

// DOM 相关
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />

// Web APIs
/// <reference lib="webworker" />
/// <reference lib="webworker.importscripts" />
/// <reference lib="webworker.iterable" />
/// <reference lib="scripthost" />
/// <reference lib="es2020.sharedmemory" />
```