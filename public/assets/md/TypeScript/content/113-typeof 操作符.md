## typeof 操作符

### 基本用法
```typescript
// typeof 操作符获取值的类型
let str = "hello";
let num = 42;
let bool = true;
let arr = [1, 2, 3];
let obj = { name: "Alice", age: 30 };

type StrType = typeof str;    // string
type NumType = typeof num;    // number
type BoolType = typeof bool;  // boolean
type ArrType = typeof arr;    // number[]
type ObjType = typeof obj;    // { name: string; age: number }

// typeof 与函数
function greet(name: string): string {
    return `Hello, ${name}!`;
}

type GreetType = typeof greet; // (name: string) => string

// typeof 与类
class Person {
    constructor(public name: string, public age: number) {}
    
    greet(): string {
        return `Hello, I'm ${this.name}`;
    }
}

type PersonType = typeof Person; // new (name: string, age: number) => Person
type PersonInstanceType = InstanceType<typeof Person>; // Person

// typeof 与枚举
enum Direction {
    Up,
    Down,
    Left,
    Right
}

type DirectionType = typeof Direction;
// DirectionType = {
//     Up: Direction.Up;
//     Down: Direction.Down;
//     Left: Direction.Left;
//     Right: Direction.Right;
//     0: "Up";
//     1: "Down";
//     2: "Left";
//     3: "Right";
// }
```

### 高级用法
```typescript
// typeof 与模块
import * as fs from "fs";

type FsType = typeof fs;
// 包含 fs 模块的所有导出类型

// typeof 与命名空间
namespace MathUtils {
    export function add(a: number, b: number): number {
        return a + b;
    }
    
    export const PI = 3.14159;
}

type MathUtilsType = typeof MathUtils;
// {
//     add: (a: number, b: number) => number;
//     PI: number;
// }

// typeof 与条件类型
type NonUndefined<T> = T extends undefined ? never : T;

function getValue<T>(obj: T): typeof obj extends undefined ? never : T {
    if (obj === undefined) {
        throw new Error("Value is undefined");
    }
    return obj;
}

// typeof 与类型推断
function createPerson(name: string, age: number) {
    return {
        name,
        age,
        greet() {
            return `Hello, I'm ${this.name}`;
        }
    };
}

type PersonReturnType = typeof createPerson;
// (name: string, age: number) => { name: string; age: number; greet(): string }

type PersonObjectType = ReturnType<typeof createPerson>;
// { name: string; age: number; greet(): string }

// 实际应用：运行时类型检查
const VALID_STATUS = ["pending", "approved", "rejected"] as const;
type Status = typeof VALID_STATUS[number]; // "pending" | "approved" | "rejected"

function isValidStatus(status: string): status is Status {
    return (VALID_STATUS as readonly string[]).includes(status);
}

// typeof 与配置对象
const APP_CONFIG = {
    apiUrl: "https://api.example.com",
    timeout: 5000,
    retries: 3,
    debug: false
} as const;

type AppConfig = typeof APP_CONFIG;
// {
//     readonly apiUrl: "https://api.example.com";
//     readonly timeout: 5000;
//     readonly retries: 3;
//     readonly debug: false;
// }

// 使用配置类型
function createApiClient(config: typeof APP_CONFIG) {
    // config 的类型是精确的字面量类型
    console.log(`API URL: ${config.apiUrl}`);
    console.log(`Timeout: ${config.timeout}ms`);
}
```