## 2. TypeScript 2.x 特性

### TypeScript 2.0 (2016年9月)

#### Null 检查

```typescript
// 启用 strictNullChecks 后
let x: number; // Error: 变量未初始化
let y: number | undefined = undefined; // 正确
let z: number | null = null; // 正确

function validateEntity(e?: Entity) {
  // e 的类型是 Entity | undefined
  if (e) {
    // e 的类型是 Entity
    return e.name;
  }
}

// 非空断言操作符
function processEntity(e: Entity | null) {
  return e!.name; // 告诉编译器 e 不为 null
}
```

#### 控制流分析

```typescript
function example(x: string | number | boolean) {
  if (typeof x === "string") {
    // x 的类型是 string
    x; // string
    x = x + " World";
  } else if (typeof x === "number") {
    // x 的类型是 number
    x; // number
    x = x + 1;
  } else {
    // x 的类型是 boolean
    x; // boolean
    x = x === true;
  }
}
```

#### Never 类型

```typescript
// never 类型表示永远不会返回的函数
function error(message: string): never {
  throw new Error(message);
}

function fail() {
  return error("Something failed");
}

function infiniteLoop(): never {
  while (true) {
    // ...
  }
}

// never 在类型保护中的应用
type Foo = string | number;

function check(x: Foo) {
  if (typeof x === "string") {
    return true;
  } else if (typeof x === "number") {
    return false;
  }
  // 这里 x 的类型是 never
  return fail();
}
```

### TypeScript 2.1 (2016年12月)

#### keyof 和查找类型

```typescript
interface Person {
  name: string;
  age: number;
  location: string;
}

// keyof 操作符
type K1 = keyof Person; // "name" | "age" | "location"
type K2 = keyof Person[]; // "length" | "push" | "pop" | ...
type K3 = keyof { [x: string]: Person }; // string

// 查找类型
type P1 = Person["name"]; // string
type P2 = Person["name" | "age"]; // string | number
type P3 = string["charAt"]; // (pos: number) => string
type P4 = string[]["push"]; // (...items: string[]) => number
```

#### 映射类型

```typescript
// Partial 映射类型
type Partial<T> = {
  [P in keyof T]?: T[P];
};

interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser = Partial<User>;
// 等价于：
// {
//   id?: number;
//   name?: string;
//   email?: string;
// }

// Readonly 映射类型
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type ReadonlyUser = Readonly<User>;
// 等价于：
// {
//   readonly id: number;
//   readonly name: string;
//   readonly email: string;
// }
```

### TypeScript 2.2 (2017年2月)

#### 对象类型和混合类型

```typescript
// object 类型
function create(o: object | null): void {
  // ...
}

create({ prop: 0 }); // OK
create(null); // OK
// create(42); // Error
// create("string"); // Error
// create(false); // Error
// create(undefined); // Error

// 支持混合类型
type Constructor<T> = new (...args: any[]) => T;

function createInstance<T>(ctor: Constructor<T>): T {
  return new ctor();
}
```

### TypeScript 2.3 (2017年4月)

#### 生成器和 Async/Await

```typescript
// 生成器支持
function* fibonacci(): IterableIterator<number> {
  let [prev, curr] = [0, 1];
  for (;;) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
  }
}

// Async/Await
async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```