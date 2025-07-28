## 4. /// <reference no-default-lib="true"/>

这是一个特殊的指令，用于告诉编译器不要包含默认的库文件。

### 基本用法

```typescript
// custom-lib.ts
/// <reference no-default-lib="true"/>
/// <reference lib="es5" />

// 只包含 ES5 库，不包含其他默认库
// 这样可以创建自定义的最小环境

interface Array<T> {
    forEach(callbackfn: (value: T, index: number, array: T[]) => void): void;
    // 只定义需要的方法
}
```

### 创建自定义运行环境

```typescript
// minimal-runtime.d.ts
/// <reference no-default-lib="true"/>
/// <reference lib="es2020" />

// 为特定运行环境定义全局变量
declare const __VERSION__: string;
declare const __ENV__: 'development' | 'production';

// 自定义全局函数
declare function log(message: string): void;
declare function assert(condition: boolean, message?: string): asserts condition;
```

### 与编译器选项配合

```json
// tsconfig.json
{
  "compilerOptions": {
    "lib": ["es2020", "dom"],
    "noLib": false
  }
}
```

```typescript
// 在这种配置下使用 no-default-lib
/// <reference no-default-lib="true"/>
/// <reference lib="es5" />
/// <reference lib="es2015.promise" />

// 只有明确引用的库才可用
Promise.resolve("hello").then(console.log);
// Array, Object 等基本类型可能不可用，除非明确引用
```