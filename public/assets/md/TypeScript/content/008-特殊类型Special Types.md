## 特殊类型（Special Types）

### any 类型
禁用类型检查，可以赋值给任何类型

```typescript
// any 类型变量
let notSure: any = 4;
notSure = "maybe a string";
notSure = false; // 也可以是 boolean

// any 数组
let list: any[] = [1, true, "free"];
list[1] = 100;

// any 对象属性
let looselyTyped: any = 4;
looselyTyped.ifItExists(); // 不会报错
looselyTyped.toFixed(); // 不会报错

// 与 unknown 的区别
let anyValue: any = "hello";
let stringValue: string = anyValue; // 允许，但不安全

// 注意：过度使用 any 会失去类型安全
```

### unknown 类型
类型安全的 any，需要类型检查后才能使用

```typescript
// unknown 基本使用
let value: unknown = 4;
value = "hello";
value = true;

// 不能直接赋值给其他类型
// let stringValue: string = value; // 错误！

// 需要类型检查或断言
if (typeof value === "string") {
    let stringValue: string = value; // 正确
    console.log(value.toUpperCase());
}

// 类型断言
let strValue = value as string; // 类型断言
// 或者
let strValue2 = <string>value; // 另一种断言语法

// 使用类型保护函数
function isString(value: unknown): value is string {
    return typeof value === "string";
}

if (isString(value)) {
    console.log(value.toUpperCase()); // 安全使用
}
```

### void 类型
表示没有返回值的函数

```typescript
// 函数没有返回值
function warnUser(): void {
    console.log("This is my warning message");
}

// void 变量通常只能是 undefined 或 null
let unusable: void = undefined;
// unusable = null; // 在 strictNullChecks 下会报错

// 箭头函数的 void 返回
const logMessage = (): void => {
    console.log("Logging...");
};

// 实际上很少需要显式声明 void
function implicitVoid() {
    console.log("No return statement");
} // 推断为 void
```

### null 和 undefined 类型
表示空值和未定义值

```typescript
// 基本声明
let u: undefined = undefined;
let n: null = null;

// 在 strictNullChecks 模式下
let num: number = 42;
// num = null; // 错误！
// num = undefined; // 错误！

// 联合类型与 null/undefined
let nullableNum: number | null = 42;
nullableNum = null; // 正确

let optionalStr: string | undefined = "hello";
optionalStr = undefined; // 正确

// 可选参数和属性
function greet(name?: string) { // name: string | undefined
    console.log(`Hello, ${name || "Guest"}`);
}

interface User {
    name: string;
    email?: string; // email: string | undefined
}

// null 和 undefined 的比较
console.log(null == undefined); // true
console.log(null === undefined); // false
```

### never 类型
表示永远不会发生的值的类型

```typescript
// 永远不会返回的函数
function error(message: string): never {
    throw new Error(message);
}

// 永远不会结束的函数
function infiniteLoop(): never {
    while (true) {
        // 死循环
    }
}

// 类型守卫的 never 分支
function assertNever(x: never): never {
    throw new Error("Unexpected object: " + x);
}

// 在类型收窄中的应用
type Shape = "circle" | "square" | "triangle";

function getArea(shape: Shape): number {
    switch (shape) {
        case "circle":
            return Math.PI * 1 * 1;
        case "square":
            return 1 * 1;
        case "triangle":
            return 0.5 * 1 * 1;
        default:
            return assertNever(shape); // 如果有未处理的情况，这里会报错
    }
}

// never 是所有类型的子类型
let neverValue: never;
let stringValue: string = neverValue; // 正确，never 可以赋值给任何类型
```