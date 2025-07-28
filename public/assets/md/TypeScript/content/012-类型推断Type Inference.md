## 类型推断（Type Inference）

### 基本类型推断
```typescript
// 从初始化值推断
let num = 42;        // number
let str = "hello";   // string
let bool = true;     // boolean
let arr = [1, 2, 3]; // number[]

// 从函数返回值推断
function getGreeting() {
    return "Hello, World!";
} // 推断为 () => string

// 从函数参数推断
function logMessage(message = "default") {
    console.log(message);
} // message 推断为 string
```

### 上下文类型推断
```typescript
// 事件处理器
window.onmousedown = function(mouseEvent) {
    // mouseEvent 被推断为 MouseEvent
    console.log(mouseEvent.button);
};

// 数组方法
let numbers = [1, 2, 3];
let doubled = numbers.map(x => x * 2); // x 被推断为 number

// 对象字面量
let person = {
    name: "John",
    age: 30
}; // 推断为 { name: string; age: number; }
```

### 最佳通用类型推断
```typescript
// 从多个候选类型中选择最佳通用类型
let arr1 = [1, 2, null]; // (number | null)[]
let arr2 = [1, "hello", true]; // (string | number | boolean)[]

// 类继承关系
class Animal {}
class Dog extends Animal {}
class Cat extends Animal {}

let animals = [new Dog(), new Cat()]; // Animal[]
```

### 类型断言与类型推断
```typescript
// 类型断言会覆盖推断
let someValue: any = "this is a string";
let strLength: number = (someValue as string).length;

// 双重推断
function createSquare(config: { color?: string; width?: number; }) {
    // ...
}

let squareOptions = { colour: "red", width: 100 }; // 注意拼写错误
// createSquare(squareOptions); // 错误！colour 不匹配

// 解决方案：类型断言
createSquare(squareOptions as { color: string; width: number; });

// 或者添加索引签名
interface SquareConfig {
    color?: string;
    width?: number;
    [propName: string]: any; // 索引签名
}
```

### 控制流类型推断
```typescript
// 条件分支中的类型收窄
function padLeft(value: string, padding: string | number) {
    if (typeof padding === "number") {
        // 在这个分支中，padding 被推断为 number
        return Array(padding + 1).join(" ") + value;
    }
    // 在这个分支中，padding 被推断为 string
    return padding + value;
}

// instanceof 类型保护
class Bird {
    fly() {}
    layEggs() {}
}

class Fish {
    swim() {}
    layEggs() {}
}

function move(animal: Bird | Fish) {
    if (animal instanceof Bird) {
        // animal 被推断为 Bird
        animal.fly();
    } else {
        // animal 被推断为 Fish
        animal.swim();
    }
}
```

### 泛型类型推断
```typescript
// 从函数参数推断泛型类型
function identity<T>(arg: T): T {
    return arg;
}

let output = identity("myString"); // T 被推断为 string

// 从多个参数推断
function map<T, U>(array: T[], func: (x: T) => U): U[] {
    return array.map(func);
}

let lengths = map(["hello", "world"], x => x.length); // T: string, U: number

// 约束类型推断
function longest<T extends { length: number }>(a: T, b: T) {
    if (a.length >= b.length) {
        return a;
    } else {
        return b;
    }
}

let result = longest("alice", "bob"); // T 推断为 string
```