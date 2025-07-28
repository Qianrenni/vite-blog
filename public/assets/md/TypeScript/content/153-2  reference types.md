## 2. /// <reference types="..." />

用于声明对特定类型定义包的依赖，通常用于声明全局类型。

### 基本用法

```typescript
// main.ts
/// <reference types="node" />
/// <reference types="jquery" />
/// <reference types="lodash" />

// 现在可以使用这些库的全局类型
import * as fs from 'fs'; // Node.js 类型可用
const $ = require('jquery'); // jQuery 类型可用

// 使用 Node.js 的全局变量
console.log(__dirname);
process.exit(0);
```

### 在声明文件中使用

```typescript
// mylib.d.ts
/// <reference types="react" />

declare namespace MyLib {
    interface ComponentProps {
        children: React.ReactNode;
    }
    
    class MyComponent extends React.Component<ComponentProps> {
        render(): JSX.Element;
    }
}
```

### 配合 DefinitelyTyped

```typescript
// custom.d.ts
/// <reference types="@types/express" />
/// <reference types="@types/mongoose" />

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

// server.ts
/// <reference path="./custom.d.ts" />

import express from 'express';
const app = express();

app.use((req, res, next) => {
    req.userId = "123"; // 类型安全
    next();
});
```