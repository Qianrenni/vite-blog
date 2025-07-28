## infer 关键字

### 基本 infer 用法
```typescript
// 基本 infer 用法
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type A = GetReturnType<() => string>;        // string
type B = GetReturnType<(x: number) => number[]>; // number[]
type C = GetReturnType<string>;              // never

// 获取函数参数类型
type GetParameters<T> = T extends (...args: infer P) => any ? P : never;

type D = GetParameters<(name: string, age: number) => void>; // [string, number]
type E = GetParameters<() => boolean>;                       // []

// 获取数组元素类型
type GetElementType<T> = T extends (infer U)[] ? U : T;

type F = GetElementType<number[]>;    // number
type G = GetElementType<string[]>;    // string
type H = GetElementType<boolean>;     // boolean
```

### infer 与泛型约束
```typescript
// infer 与泛型约束结合
type GetPromiseType<T> = T extends Promise<infer U> ? U : T;

type A1 = GetPromiseType<Promise<string>>;        // string
type B1 = GetPromiseType<Promise<number[]>>;      // number[]
type C1 = GetPromiseType<string>;                 // string

// 处理嵌套 Promise
type UnwrapPromise<T> = T extends Promise<infer U> ? UnwrapPromise<U> : T;

type D1 = UnwrapPromise<Promise<string>>;                    // string
type E1 = UnwrapPromise<Promise<Promise<number>>>;           // number
type F1 = UnwrapPromise<Promise<Promise<Promise<boolean>>>>; // boolean

// 获取对象属性类型
type GetPropType<T, K extends keyof T> = T extends { [P in K]: infer U } ? U : never;

interface User {
    name: string;
    age: number;
    email: string;
}

type UserNameType = GetPropType<User, "name">; // string
type UserAgeType = GetPropType<User, "age">;   // number
```

### infer 与条件类型组合
```typescript
// infer 与条件类型组合
type GetLast<T extends any[]> = T extends [...any[], infer U] ? U : never;

type A = GetLast<[1, 2, 3]>;        // 3
type B = GetLast<[string, number]>;  // number
type C = GetLast<[]>;               // never

// 获取数组第一个元素
type GetFirst<T extends any[]> = T extends [infer U, ...any[]] ? U : never;

type D = GetFirst<[1, 2, 3]>;       // 1
type E = GetFirst<[string, number]>; // string

// 获取数组长度
type GetLength<T extends any[]> = T extends { length: infer U } ? U : never;

type F = GetLength<[1, 2, 3]>;      // 3
type G = GetLength<[]>;             // 0

// 条件类型中的多个 infer
type Split<T extends string, U extends string> = 
    T extends `${infer L}${U}${infer R}` ? [L, R] : [T, ""];

type H = Split<"hello world", " ">;  // ["hello", "world"]
type I = Split<"hello", "-">;        // ["hello", ""]
```

### infer 的高级应用
```typescript
// infer 的高级应用
// 提取函数的 this 类型
type GetThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any ? U : unknown;

class MyClass {
    value: number = 42;
    method() {
        return this.value;
    }
}

type ThisType = GetThisParameterType<MyClass['method']>; // MyClass

// 提取字符串字面量类型
type GetStringLength<T extends string> = T extends { length: infer U } ? U : never;

type Length = GetStringLength<"hello">; // 5

// 类型级别的字符串操作
type CapitalizeString<T extends string> = T extends `${infer First}${infer Rest}` 
    ? `${Uppercase<First>}${Rest}` 
    : T;

type Capitalized = CapitalizeString<"hello">; // "Hello"

// 提取联合类型的元素
type UnionToIntersection<U> = 
    (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

type A2 = UnionToIntersection<string | number>; // string & number (never)
type B2 = UnionToIntersection<{ a: string } | { b: number }>; // { a: string } & { b: number }
```