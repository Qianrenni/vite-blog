## for..of 语句

### 基本 for..of 用法
```typescript
// for..of 与数组
let numbers: number[] = [1, 2, 3, 4, 5];
for (let num of numbers) {
    console.log(num);
}

// for..of 与字符串
let text: string = "hello";
for (let char of text) {
    console.log(char); // h, e, l, l, o
}

// for..of 与 Map
let map = new Map<string, number>([
    ["a", 1],
    ["b", 2],
    ["c", 3]
]);

for (let [key, value] of map) {
    console.log(`${key}: ${value}`);
}

// for..of 与 Set
let set = new Set<string>(["apple", "banana", "orange"]);
for (let fruit of set) {
    console.log(fruit);
}

// for..of 与生成器
function* colorGenerator(): Generator<string> {
    yield "red";
    yield "green";
    yield "blue";
}

for (let color of colorGenerator()) {
    console.log(color); // red, green, blue
}
```

### for..of 与解构
```typescript
// for..of 与数组解构
let pairs: [string, number][] = [
    ["a", 1],
    ["b", 2],
    ["c", 3]
];

for (let [key, value] of pairs) {
    console.log(`${key}: ${value}`);
}

// for..of 与对象解构（需要自定义迭代器）
interface Person {
    name: string;
    age: number;
}

class PeopleCollection implements Iterable<Person> {
    constructor(private people: Person[]) {}
    
    *[Symbol.iterator](): Iterator<Person> {
        for (let person of this.people) {
            yield person;
        }
    }
}

let people = new PeopleCollection([
    { name: "Alice", age: 30 },
    { name: "Bob", age: 25 },
    { name: "Charlie", age: 35 }
]);

for (let { name, age } of people) {
    console.log(`${name} is ${age} years old`);
}

// for..of 与嵌套解构
let matrix: [number, number][][] = [
    [[1, 2], [3, 4]],
    [[5, 6], [7, 8]]
];

for (let [row1, row2] of matrix) {
    console.log(`Row 1: [${row1}], Row 2: [${row2}]`);
}

for (let [[a, b], [c, d]] of matrix) {
    console.log(`a=${a}, b=${b}, c=${c}, d=${d}`);
}
```

### for..of 与类型安全
```typescript
// for..of 的类型推断
let items: (string | number)[] = ["hello", 42, "world", 100];

for (let item of items) {
    // item 的类型是 string | number
    if (typeof item === "string") {
        console.log(item.toUpperCase()); // 类型安全
    } else {
        console.log(item.toFixed(2)); // 类型安全
    }
}

// for..of 与泛型
function processIterable<T>(iterable: Iterable<T>): T[] {
    let result: T[] = [];
    for (let item of iterable) {
        result.push(item);
    }
    return result;
}

let stringArray = processIterable(["a", "b", "c"]); // string[]
let numberArray = processIterable(new Set([1, 2, 3])); // number[]

// for..of 与联合类型
type DataItem = { type: "string"; value: string } | { type: "number"; value: number };

function* dataGenerator(): Generator<DataItem> {
    yield { type: "string", value: "hello" };
    yield { type: "number", value: 42 };
    yield { type: "string", value: "world" };
}

for (let item of dataGenerator()) {
    // TypeScript 可以正确推断 item 的类型
    if (item.type === "string") {
        console.log(item.value.toUpperCase()); // 安全访问 string 方法
    } else {
        console.log(item.value.toFixed(2)); // 安全访问 number 方法
    }
}
```

### for..of 的性能考虑
```typescript
// for..of 与传统循环的性能比较
let largeArray = Array.from({ length: 1000000 }, (_, i) => i);

// for..of 循环
console.time("for..of");
let sum1 = 0;
for (let item of largeArray) {
    sum1 += item;
}
console.timeEnd("for..of");

// 传统 for 循环
console.time("traditional for");
let sum2 = 0;
for (let i = 0; i < largeArray.length; i++) {
    sum2 += largeArray[i];
}
console.timeEnd("traditional for");

// forEach 循环
console.time("forEach");
let sum3 = 0;
largeArray.forEach(item => {
    sum3 += item;
});
console.timeEnd("forEach");

// 注意：实际性能可能因 JavaScript 引擎而异
```