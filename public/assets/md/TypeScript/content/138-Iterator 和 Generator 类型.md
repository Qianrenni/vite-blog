## Iterator 和 Generator 类型

### Iterator 类型详解
```typescript
// Iterator 类型定义
interface Iterator<T, TReturn = any, TNext = undefined> {
    // TReturn: next() 方法返回值中的 value 类型（当 done 为 true 时）
    // TNext: next() 方法接收的参数类型
    next(...args: [] | [TNext]): IteratorResult<T, TReturn>;
    return?(value?: TReturn): IteratorResult<T, TReturn>;
    throw?(e?: any): IteratorResult<T, TReturn>;
}

interface IteratorResult<T, TReturn = any> {
    done: false;
    value: T;
} | {
    done: true;
    value: TReturn;
}

// 基本 Iterator 类型使用
type NumberIterator = Iterator<number>;
type StringIterator = Iterator<string, string>; // 返回字符串
type BooleanIterator = Iterator<boolean, void, number>; // 接收数字参数

// 实现自定义 Iterator
class CustomIterator implements Iterator<string> {
    private index = 0;
    private items = ["first", "second", "third"];
    
    next(): IteratorResult<string> {
        if (this.index < this.items.length) {
            return {
                done: false,
                value: this.items[this.index++]
            };
        } else {
            return {
                done: true,
                value: undefined as any
            };
        }
    }
}

// 使用自定义 Iterator
let customIter = new CustomIterator();
console.log(customIter.next()); // { done: false, value: "first" }
console.log(customIter.next()); // { done: false, value: "second" }
console.log(customIter.next()); // { done: false, value: "third" }
console.log(customIter.next()); // { done: true, value: undefined }
```

### Generator 类型详解
```typescript
// Generator 类型定义
interface Generator<T = unknown, TReturn = any, TNext = unknown> 
    extends Iterator<T, TReturn, TNext> {
    // Generator 继承自 Iterator，添加了额外的方法
    next(...args: [] | [TNext]): IteratorResult<T, TReturn>;
    return(value: TReturn): IteratorResult<T, TReturn>;
    throw(e: any): IteratorResult<T, TReturn>;
    
    // Symbol.iterator 使 Generator 本身也是可迭代的
    [Symbol.iterator](): Generator<T, TReturn, TNext>;
}

// Generator 类型参数
// T: 生成的值的类型
// TReturn: return() 方法的返回值类型
// TNext: next() 方法接收的参数类型

type SimpleGenerator = Generator<number>;
type GeneratorWithReturn = Generator<number, string>;
type GeneratorWithNext = Generator<number, void, string>;
type FullGenerator = Generator<number, string, boolean>;

// 基本 Generator 类型使用
function* basicGenerator(): Generator<number> {
    yield 1;
    yield 2;
    yield 3;
}

// 带返回值的 Generator
function* generatorWithReturnType(): Generator<number, string> {
    yield 1;
    yield 2;
    return "finished";
}

// 接收参数的 Generator
function* generatorWithNextType(): Generator<number, void, string> {
    let input = yield 1;
    console.log(`Received: ${input}`);
    yield 2;
}

// 完整类型的 Generator
function* fullGenerator(): Generator<number, string, boolean> {
    let shouldContinue = yield 1;
    if (shouldContinue) {
        yield 2;
        return "completed";
    } else {
        return "aborted";
    }
}
```

### AsyncIterator 和 AsyncGenerator 类型
```typescript
// AsyncIterator 类型
interface AsyncIterator<T, TReturn = any, TNext = undefined> {
    next(...args: [] | [TNext]): Promise<IteratorResult<T, TReturn>>;
    return?(value?: TReturn): Promise<IteratorResult<T, TReturn>>;
    throw?(e?: any): Promise<IteratorResult<T, TReturn>>;
}

// AsyncGenerator 类型
interface AsyncGenerator<T = unknown, TReturn = any, TNext = unknown> 
    extends AsyncIterator<T, TReturn, TNext> {
    next(...args: [] | [TNext]): Promise<IteratorResult<T, TReturn>>;
    return(value: TReturn): Promise<IteratorResult<T, TReturn>>;
    throw(e: any): Promise<IteratorResult<T, TReturn>>;
    [Symbol.asyncIterator](): AsyncGenerator<T, TReturn, TNext>;
}

// 异步生成器函数
async function* asyncGenerator(): AsyncGenerator<number> {
    for (let i = 1; i <= 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        yield i;
    }
}

// 使用异步生成器
async function useAsyncGenerator() {
    for await (let num of asyncGenerator()) {
        console.log(num); // 1, 2, 3, 4, 5 (每 100ms 输出一个)
    }
}

// 异步生成器的完整类型
async function* fullAsyncGenerator(): AsyncGenerator<string, number, boolean> {
    let shouldContinue = yield "first";
    if (shouldContinue) {
        yield "second";
        return 42;
    } else {
        return 0;
    }
}

// 使用完整的异步生成器
async function useFullAsyncGenerator() {
    let gen = fullAsyncGenerator();
    
    let first = await gen.next(); // { value: "first", done: false }
    console.log(first);
    
    let second = await gen.next(true); // { value: "second", done: false }
    console.log(second);
    
    let result = await gen.next(); // { value: 42, done: true }
    console.log(result);
}
```

### 实用工具类型
```typescript
// 自定义 Iterator 工具类型
type IteratorElementType<T> = T extends Iterator<infer U> ? U : never;
type GeneratorElementType<T> = T extends Generator<infer U> ? U : never;
type AsyncIteratorElementType<T> = T extends AsyncIterator<infer U> ? U : never;

// 使用工具类型
type MyIterator = Iterator<string>;
type MyIteratorElement = IteratorElementType<MyIterator>; // string

type MyGenerator = Generator<number>;
type MyGeneratorElement = GeneratorElementType<MyGenerator>; // number

type MyAsyncIterator = AsyncIterator<boolean>;
type MyAsyncIteratorElement = AsyncIteratorElementType<MyAsyncIterator>; // boolean

// 创建可迭代的工具函数
function createIterable<T>(items: T[]): Iterable<T> {
    return {
        *[Symbol.iterator]() {
            for (let item of items) {
                yield item;
            }
        }
    };
}

// 创建异步可迭代的工具函数
async function* createAsyncIterable<T>(
    items: T[],
    delay: number = 0
): AsyncGenerator<T> {
    for (let item of items) {
        if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        yield item;
    }
}

// 使用工具函数
let iterable = createIterable([1, 2, 3, 4, 5]);
for (let item of iterable) {
    console.log(item);
}

async function useAsyncIterable() {
    for await (let item of createAsyncIterable(["a", "b", "c"], 1000)) {
        console.log(item); // 每秒输出一个
    }
}

// 类型安全的迭代器包装器
class IteratorWrapper<T> implements Iterable<T> {
    constructor(private iterator: Iterator<T>) {}
    
    *[Symbol.iterator](): Iterator<T> {
        let result = this.iterator.next();
        while (!result.done) {
            yield result.value;
            result = this.iterator.next();
        }
    }
}

// 使用迭代器包装器
let wrapper = new IteratorWrapper(basicGenerator());
for (let item of wrapper) {
    console.log(item); // 1, 2, 3
}
```