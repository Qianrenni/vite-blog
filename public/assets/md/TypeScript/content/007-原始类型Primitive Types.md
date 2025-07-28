## 原始类型（Primitive Types）

### boolean 类型
表示逻辑值：true 或 false

```typescript
// 基本声明
let isDone: boolean = false;
let isCompleted: boolean = true;

// 从表达式推断
let hasPermission = true; // 类型推断为 boolean

// 在条件语句中使用
if (isDone) {
    console.log("Task completed");
}

// 逻辑运算
let canAccess = isDone && hasPermission; // boolean
let shouldRetry = !isDone || !hasPermission; // boolean
```

### number 类型
表示所有数字类型（整数和浮点数）

```typescript
// 整数
let decimal: number = 42;
let hex: number = 0xf00d;        // 十六进制
let binary: number = 0b1010;     // 二进制
let octal: number = 0o744;       // 八进制

// 浮点数
let float: number = 3.14;
let scientific: number = 1.23e5; // 科学计数法

// 特殊数值
let infinity: number = Infinity;
let notANumber: number = NaN;

// 从表达式推断
let count = 10; // number
let result = 10 / 3; // number

// 数学运算
let sum = decimal + float; // number
let product = decimal * 2; // number
```

### string 类型
表示文本数据

```typescript
// 字符串字面量
let color: string = "blue";
let fullName: string = 'Bob Smith';

// 模板字符串
let firstName: string = "John";
let lastName: string = "Doe";
let fullName2: string = `${firstName} ${lastName}`;
let greeting: string = `Hello, ${fullName2}!`;

// 多行字符串
let multiline: string = `
    This is a
    multiline
    string
`;

// 字符串方法
let message: string = "Hello World";
let upperCase = message.toUpperCase(); // string
let length = message.length; // number
let substring = message.substring(0, 5); // string

// 从表达式推断
let text = "Hello"; // string
let template = `Count: ${count}`; // string
```

### bigint 类型
表示任意精度的整数（ES2020）

```typescript
// BigInt 字面量
let bigNumber: bigint = 123n;
let anotherBig: bigint = BigInt(456);

// BigInt 运算
let sumBig = bigNumber + anotherBig; // bigint
let productBig = bigNumber * 2n; // 注意：必须使用 n 后缀

// 与 number 的区别
let regularNumber: number = 123;
// let invalid = bigNumber + regularNumber; // 错误：不能混合使用

// BigInt 方法
let parsedBig = BigInt("9007199254740991");
let maxSafe = BigInt(Number.MAX_SAFE_INTEGER);

// 注意事项
// BigInt 不能与 Math 对象一起使用
// BigInt 不能序列化为 JSON
```

### symbol 类型
表示唯一的标识符（ES2015）

```typescript
// 创建 Symbol
let sym1: symbol = Symbol();
let sym2: symbol = Symbol("key"); // 可选描述
let sym3: symbol = Symbol("key");

// Symbol 是唯一的
console.log(sym2 === sym3); // false

// Symbol 作为对象属性键
let obj = {
    [sym1]: "value1",
    [sym2]: "value2"
};

// 获取 Symbol 属性
console.log(obj[sym1]); // "value1"

// 全局 Symbol 注册表
let globalSym = Symbol.for("globalKey");
let sameGlobalSym = Symbol.for("globalKey");
console.log(globalSym === sameGlobalSym); // true

// 获取 Symbol 描述
console.log(sym2.description); // "key"

// 内置 Symbol
let iteratorSymbol = Symbol.iterator;
let toStringSymbol = Symbol.toStringTag;
```