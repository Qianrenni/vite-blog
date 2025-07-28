## 4. TypeScript 4.x 特性

### TypeScript 4.0 (2020年8月)

#### 可变参数元组类型

```typescript
// 可变参数元组类型
type Arr = readonly any[];

function concat<T extends Arr, U extends Arr>(arr1: T, arr2: U): [...T, ...U] {
  return [...arr1, ...arr2];
}

const result = concat([1, 2, 3], ["hello"]); // [number, number, number, string]

// 剩余参数和展开
type Unshift<T extends any[], U> = [U, ...T];
type Push<T extends any[], U> = [...T, U];

type Test1 = Unshift<[number, string], boolean>; // [boolean, number, string]
type Test2 = Push<[number, string], boolean>; // [number, string, boolean]
```

#### 标签模板字符串类型

```typescript
// 更好的标签模板字符串类型推断
function tag<T extends string>(strings: TemplateStringsArray, ...values: T[]) {
  // ...
}

const result = tag`Hello ${"world"}!`; // T 被推断为 "world"
```

### TypeScript 4.1 (2020年11月)

#### 模板字面量类型

```typescript
// 模板字面量类型
type World = "world";
type Greeting = `hello ${World}`; // "hello world"

// 与联合类型结合
type VerticalAlignment = "top" | "middle" | "bottom";
type HorizontalAlignment = "left" | "center" | "right";

// 获取所有可能的对齐组合
type Alignment = `${VerticalAlignment}-${HorizontalAlignment}`;
// "top-left" | "top-center" | "top-right" | "middle-left" | ...

// 字符串操作类型
type Getter<T extends string> = `get${Capitalize<T>}`;
type Setter<T extends string> = `set${Capitalize<T>}`;

type FirstNameGetter = Getter<"firstName">; // "getFirstName"
type LastNameSetter = Setter<"lastName">; // "setLastName"
```

#### Key Remapping in Mapped Types

```typescript
// 映射类型中的键重映射
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type Setters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

interface Person {
  name: string;
  age: number;
  email: string;
}

type PersonAccessors = Getters<Person> & Setters<Person>;
// {
//   getName: () => string;
//   getAge: () => number;
//   getEmail: () => string;
//   setName: (value: string) => void;
//   setAge: (value: number) => void;
//   setEmail: (value: string) => void;
// }
```

### TypeScript 4.2 (2021年2月)

#### 剩余参数的类型推断改进

```typescript
// 更好的剩余参数类型推断
function call<T extends any[], R>(fn: (...args: T) => R, ...args: T): R {
  return fn(...args);
}

function add(a: number, b: number): number {
  return a + b;
}

const result = call(add, 1, 2); // 正确推断为 number
```

#### 元组中的前导/尾随逗号

```typescript
// 支持前导/尾随逗号
type Foo = [
  string,
  number,
  boolean,
];

const foo: Foo = [
  "hello",
  42,
  true,
];
```

### TypeScript 4.3 (2021年5月)

#### Separate Write Types on Properties

```typescript
// 属性的读写类型分离
class Thing {
  #size = 0;
  
  get size(): number {
    return this.#size;
  }
  
  set size(value: string | number | boolean) {
    let num = Number(value);
    if (!Number.isFinite(num)) {
      this.#size = 0;
      return;
    }
    this.#size = num;
  }
}
```

### TypeScript 4.4 (2021年8月)

#### 控制流分析改进

```typescript
// 更智能的控制流分析
function foo(param: unknown) {
  if (param && typeof param === "object" && "name" in param) {
    // 在 TypeScript 4.4 之前，这可能不会正确推断
    // 现在可以正确推断 param 的类型
    console.log(param.name); // OK
  }
}
```

#### Symbol 和模板字符串索引签名

```typescript
// Symbol 索引签名
const strKey = Symbol();
const numKey = Symbol();
const boolKey = Symbol();

type Key = typeof strKey | typeof numKey | typeof boolKey;

interface Foo {
  [strKey]: string;
  [numKey]: number;
  [boolKey]: boolean;
}

const foo: Foo = {
  [strKey]: "hello",
  [numKey]: 42,
  [boolKey]: true
};
```

### TypeScript 4.5 (2021年11月)

#### Awaited 类型

```typescript
// Awaited 类型用于递归解包 Promise
type A = Awaited<Promise<string>>; // string
type B = Awaited<Promise<Promise<number>>>; // number
type C = Awaited<boolean | Promise<number>>; // boolean | number

// 在 lib.es2015.promise.d.ts 中的定义
// type Awaited<T> = T extends null | undefined ? T : 
//   T extends object & { then(onfulfilled: infer F): any } ? 
//     F extends ((value: infer V, ...args: any) => any) ? 
//       Awaited<V> : 
//       never : 
//   T;
```

#### Import Assertions

```typescript
// 导入断言
import obj from "./something.json" assert { type: "json" };

// 动态导入断言
const obj = await import("./something.json", { 
  assert: { type: "json" } 
});
```