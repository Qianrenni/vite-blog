## keyof 操作符

### 基本用法
```typescript
// keyof 操作符获取对象类型的所有键名
interface User {
    id: string;
    name: string;
    email: string;
    age: number;
}

// 获取所有键名的联合类型
type UserKeys = keyof User;
// UserKeys = "id" | "name" | "email" | "age"

// 实际应用
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

let user: User = {
    id: "123",
    name: "Alice",
    email: "alice@example.com",
    age: 30
};

let userName = getProperty(user, "name"); // string 类型
let userAge = getProperty(user, "age");   // number 类型
// let invalid = getProperty(user, "invalid"); // 编译错误

// keyof 与索引签名
interface Dictionary {
    [key: string]: any;
}

type DictKeys = keyof Dictionary;
// DictKeys = string | number (因为数字键会转换为字符串)

// keyof 与数字索引
interface NumericArray {
    [index: number]: string;
}

type NumericKeys = keyof NumericArray;
// NumericKeys = number | "length" | "toString" | "toLocaleString" | "push" | ...
```

### 高级用法
```typescript
// keyof 与泛型约束
function pluck<T, K extends keyof T>(array: T[], key: K): T[K][] {
    return array.map(item => item[key]);
}

let users: User[] = [
    { id: "1", name: "Alice", email: "alice@example.com", age: 30 },
    { id: "2", name: "Bob", email: "bob@example.com", age: 25 }
];

let names = pluck(users, "name"); // string[]
let ages = pluck(users, "age");   // number[]

// keyof 与条件类型
type FunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? K : never
}[keyof T];

type NonFunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K
}[keyof T];

interface SampleObject {
    name: string;
    age: number;
    greet(): string;
    calculate(x: number, y: number): number;
}

type FuncProps = FunctionPropertyNames<SampleObject>;     // "greet" | "calculate"
type NonFuncProps = NonFunctionPropertyNames<SampleObject>; // "name" | "age"

// keyof 与映射类型
type Partial<T> = {
    [P in keyof T]?: T[P];
};

type Required<T> = {
    [P in keyof T]-?: T[P];
};

type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};

// 实际应用：类型安全的对象操作
class ObjectUtils {
    static hasKey<T extends object>(obj: T, key: keyof any): key is keyof T {
        return key in obj;
    }
    
    static getKeys<T extends object>(obj: T): (keyof T)[] {
        return Object.keys(obj) as (keyof T)[];
    }
    
    static pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
        const result = {} as Pick<T, K>;
        keys.forEach(key => {
            if (key in obj) {
                result[key] = obj[key];
            }
        });
        return result;
    }
}
```