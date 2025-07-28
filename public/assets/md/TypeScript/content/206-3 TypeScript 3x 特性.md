## 3. TypeScript 3.x 特性

### TypeScript 3.0 (2018年7月)

#### 元组中的剩余元素

```typescript
// 带标签的元组
type Foo = [number, string, boolean];

// 剩余元素
type Arr = readonly any[];

// 剩余元素在元组中的使用
type Bar = [boolean, ...string[]]; // [boolean, string, string, ...]

function foo(...args: [number, string, boolean]) {
  // ...
}

function bar(...args: [number, ...string[]]) {
  // 第一个参数必须是 number，其余参数是 string
  const [first, ...rest] = args;
  // first: number
  // rest: string[]
}
```

#### 项目引用

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true
  }
}

// packages/core/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "../../lib/core"
  },
  "references": [
    { "path": "../shared" }
  ]
}
```

### TypeScript 3.1 (2018年9月)

#### 映射类型中的属性

```typescript
// 映射类型现在可以处理属性
function homomorphic<T>(arg: T): T {
  return arg;
}

// 支持对数组和元组的映射
type MapToPromise<T> = { [K in keyof T]: Promise<T[K]> };

type Coordinate = [number, number];
type PromiseCoordinate = MapToPromise<Coordinate>; // [Promise<number>, Promise<number>]

type Foo = { a: string; b: number; c: boolean };
type PromiseFoo = MapToPromise<Foo>; // { a: Promise<string>; b: Promise<number>; c: Promise<boolean> }
```

### TypeScript 3.2 (2018年11月)

#### BigInt 支持

```typescript
// BigInt 类型支持
const big: bigint = BigInt(100);
const anotherBig: bigint = 100n;

// BigInt 运算
const result = big + anotherBig;
const comparison = big > anotherBig;
```

#### 严格函数类型

```typescript
// 启用 strictFunctionTypes 后，函数参数类型检查更严格
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

// 在严格模式下，这会报错
interface Comparer<T> {
  compare: (a: T, b: T) => number;
}

declare let animalComparer: Comparer<Animal>;
declare let dogComparer: Comparer<Dog>;

// 在严格模式下，这会报错
// animalComparer = dogComparer; // Error
```

### TypeScript 3.4 (2019年3月)

#### const 断言

```typescript
// const 断言
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  debug: true
} as const;

// apiUrl 的类型是 "https://api.example.com" 而不是 string
// timeout 的类型是 5000 而不是 number
// debug 的类型是 true 而不是 boolean

// 数组 const 断言
const colors = ["red", "green", "blue"] as const;
// 类型是 readonly ["red", "green", "blue"]

// 单个值 const 断言
const PI = 3.14159 as const; // 类型是 3.14159 而不是 number
```

#### 更智能的类型推断

```typescript
// 更好的数组类型推断
function getArray() {
  return [1, 2, 3]; // 推断为 number[]
}

function getTuple() {
  return [1, "hello", true] as const; // 推断为 [1, "hello", true]
}
```