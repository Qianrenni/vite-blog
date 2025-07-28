## 数组类型（Array Types）

### 基本数组声明
```typescript
// 方式一：类型[]
let list1: number[] = [1, 2, 3];
let list2: string[] = ["a", "b", "c"];
let list3: boolean[] = [true, false, true];

// 方式二：Array<类型>
let list4: Array<number> = [1, 2, 3];
let list5: Array<string> = ["a", "b", "c"];

// 从数组字面量推断
let inferredList = [1, 2, 3]; // number[]
let mixedList = [1, "hello", true]; // (string | number | boolean)[]
```

### 数组操作
```typescript
let numbers: number[] = [1, 2, 3, 4, 5];

// 访问元素
let first = numbers[0]; // number
let last = numbers[numbers.length - 1]; // number

// 修改数组
numbers[0] = 10;
numbers.push(6); // 添加到末尾
numbers.unshift(0); // 添加到开头
let removed = numbers.pop(); // 移除最后一个元素

// 数组方法
let doubled = numbers.map(x => x * 2); // number[]
let evens = numbers.filter(x => x % 2 === 0); // number[]
let sum = numbers.reduce((acc, x) => acc + x, 0); // number

// 数组解构
let [firstElement, secondElement] = numbers;
let [head, ...tail] = numbers; // head: number, tail: number[]
```

### 多维数组
```typescript
// 二维数组
let matrix: number[][] = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

let firstRow = matrix[0]; // number[]
let firstElement = matrix[0][0]; // number

// 三维数组
let cube: string[][][] = [[["a"]]];
```

### 只读数组
```typescript
// 只读数组类型
let readonlyArray: readonly number[] = [1, 2, 3];
// readonlyArray[0] = 10; // 错误！只读数组不能修改

// ReadonlyArray 类型
let readonlyNumbers: ReadonlyArray<number> = [1, 2, 3];
// readonlyNumbers.push(4); // 错误！

// 数组转只读数组
let mutableArray: number[] = [1, 2, 3];
let readOnlyView: readonly number[] = mutableArray;
// readOnlyView[0] = 10; // 错误！
mutableArray[0] = 10; // 正确
```