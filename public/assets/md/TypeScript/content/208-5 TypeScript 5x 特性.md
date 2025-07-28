## 5. TypeScript 5.x 特性

### TypeScript 5.0 (2023年3月)

#### 装饰器标准化

```typescript
// 新的装饰器语法（符合 TC39 提案）
function loggedMethod<This, Args extends any[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
) {
  const methodName = String(context.name);
  
  function replacementMethod(this: This, ...args: Args): Return {
    console.log(`LOG: Entering method '${methodName}'.`);
    const result = target.call(this, ...args);
    console.log(`LOG: Exiting method '${methodName}'.`);
    return result;
  }
  
  return replacementMethod;
}

class Person {
  name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  @loggedMethod
  greet() {
    console.log(`Hello, my name is ${this.name}.`);
  }
}
```

#### const 类型参数

```typescript
// const 类型参数
function f<const T>(x: T) {
  // ...
}

// 在映射类型中使用 const
type MappedType<const T> = {
  [K in keyof T]: T[K];
};
```

#### 多个配置文件扩展

```json
// tsconfig.json
{
  "extends": [
    "@tsconfig/strictest/tsconfig.json",
    "@tsconfig/node18/tsconfig.json"
  ],
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

### TypeScript 5.1 (2023年5月)

#### 未解析的 JSX 元素类型

```typescript
// 更好的 JSX 元素类型推断
const MyComponent = (props: { name: string }) => {
  return <div>Hello, {props.name}!</div>;
};

// 在 TypeScript 5.1 中，未解析的 JSX 元素有更好的类型推断
```

#### undefined 在可选属性中更准确

```typescript
// 可选属性现在更准确地反映 undefined
interface Person {
  name: string;
  age?: number;
}

function processPerson(person: Person) {
  // 在 TypeScript 5.1 中，age 的类型是 number | undefined
  if (person.age !== undefined) {
    // age 现在被正确缩小为 number
    console.log(person.age.toFixed(2));
  }
}
```

### TypeScript 5.2 (2023年9月)

#### using 声明和显式资源管理

```typescript
// using 声明（需要 Symbol.dispose）
{
  using file = new TempFile("example.txt");
  // file 在块结束时自动清理
}

// await using 声明（需要 Symbol.asyncDispose）
{
  await using connection = await connectToDatabase();
  // connection 在块结束时自动异步清理
}

// 实现显式资源管理
class TempFile implements Disposable {
  #path: string;
  
  constructor(path: string) {
    this.#path = path;
    console.log(`Created temp file: ${path}`);
  }
  
  [Symbol.dispose]() {
    console.log(`Cleaning up temp file: ${this.#path}`);
    // 清理逻辑
  }
}
```

#### 命名和匿名元组元素

```typescript
// 命名元组元素
type PersonTuple = [name: string, age: number, email: string];

function createPerson(...args: PersonTuple) {
  const [name, age, email] = args;
  return { name, age, email };
}

// 在解构时有更好的提示
const person: PersonTuple = ["Alice", 30, "alice@example.com"];
const [name, age, email] = person; // IDE 会显示名称提示
```

### TypeScript 5.3 (2023年11月)

#### Import Attributes

```typescript
// Import Attributes（替代 Import Assertions）
import obj from "./something.json" with { type: "json" };

// 动态导入
const obj = await import("./something.json", { 
  with: { type: "json" } 
});
```

#### 更好的 JSX 属性类型检查

```typescript
// 改进的 JSX 属性类型检查
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const Button = (props: ButtonProps) => {
  // 更好的类型检查和自动完成
  return <button {...props} />;
};
```