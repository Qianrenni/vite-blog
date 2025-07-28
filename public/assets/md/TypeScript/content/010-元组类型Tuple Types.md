## 元组类型（Tuple Types）

### 基本元组
```typescript
// 基本元组声明
let tuple: [string, number] = ["hello", 10];
let person: [string, number, boolean] = ["John", 30, true];

// 访问元组元素
let name = tuple[0]; // string
let age = tuple[1]; // number

// 元组长度是固定的
// tuple[2] = "extra"; // 错误！索引超出范围

// 元组解构
let [str, num] = tuple;
let [firstName, personAge, isMarried] = person;
```

### 可选元素元组
```typescript
// 可选元素（TypeScript 3.0+）
let optionalTuple: [string, number?] = ["hello"];
optionalTuple = ["hello", 42]; // 也可以有两个元素

let [str1, num1] = optionalTuple; // num1: number | undefined
```

### 剩余元素元组
```typescript
// 剩余元素（TypeScript 3.0+）
let restTuple: [number, ...string[]] = [1];
restTuple = [1, "a"];
restTuple = [1, "a", "b", "c"];

// 混合使用
let mixedTuple: [string, ...number[], boolean] = ["start", true];
mixedTuple = ["start", 1, 2, 3, true];
```

### 元组标签
```typescript
// 带标签的元组（TypeScript 4.0+）
let labeledTuple: [name: string, age: number] = ["John", 30];

// 访问带标签的元素
let personName = labeledTuple[0]; // string
let personAge = labeledTuple[1]; // number
```

### 元组方法
```typescript
let tupleData: [string, number] = ["hello", 42];

// concat 方法返回数组
let newArray = tupleData.concat(["world", 100]); // (string | number)[]

// slice 方法
let sliced = tupleData.slice(0, 1); // [string]

// 注意：push/pop 等修改方法会改变类型
tupleData.push("extra"); // 现在 tupleData 变成了 (string | number)[]
```