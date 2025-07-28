## 与 JavaScript 的关系

### 超集关系
```
TypeScript ⊃ JavaScript
```
所有有效的 JavaScript 代码都是有效的 TypeScript 代码。

### 语法兼容性
```javascript
// 这是有效的 JavaScript 和 TypeScript
function greet(name) {
    return "Hello, " + name;
}
```

```typescript
// 这是 TypeScript 特有语法
function greet(name: string): string {
    return "Hello, " + name;
}
```

### 编译转换
```
TypeScript (.ts) → TypeScript Compiler → JavaScript (.js)
```

### 版本对应关系
| TypeScript 版本 | 支持的 ECMAScript 版本 |
|----------------|----------------------|
| TS 1.0         | ES3, ES5             |
| TS 2.0         | ES3, ES5, ES2015     |
| TS 3.0         | ES3, ES5, ES2015+    |
| TS 4.0+        | ES3, ES5, ES2015+    |