## 1. TypeScript 1.x 特性

### TypeScript 1.0 (2014年4月)

#### 核心特性

```typescript
// 基础类型系统
interface User {
  name: string;
  age: number;
}

class UserService {
  private users: User[] = [];
  
  addUser(user: User): void {
    this.users.push(user);
  }
  
  getUser(name: string): User {
    return this.users.filter(user => user.name === name)[0];
  }
}

// 泛型支持
interface Repository<T> {
  save(item: T): void;
  findById(id: number): T;
  findAll(): T[];
}

class UserRepository implements Repository<User> {
  save(item: User): void {
    // 实现保存逻辑
  }
  
  findById(id: number): User {
    // 实现查找逻辑
    return { name: "Default", age: 0 };
  }
  
  findAll(): User[] {
    return [];
  }
}

// 函数重载
function padding(value: number): string;
function padding(value: string): string;
function padding(value: any): string {
  if (typeof value === "number") {
    return Array(value + 1).join(" ");
  }
  return value;
}

// 联合类型
type Primitive = string | number | boolean;

function processValue(value: Primitive): string {
  return value.toString();
}

// 可选参数和属性
interface Config {
  apiUrl?: string;
  timeout?: number;
  debug?: boolean;
}

function createConfig(config?: Config): Config {
  return {
    apiUrl: "http://localhost:3000",
    timeout: 5000,
    debug: false,
    ...config
  };
}
```

### TypeScript 1.3 (2014年10月)

#### 保护性（Protected）修饰符

```typescript
class Animal {
  protected name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  move(distance: number = 0): void {
    console.log(`${this.name} moved ${distance}m.`);
  }
}

class Dog extends Animal {
  bark(): void {
    console.log(`${this.name} barks.`);
  }
  
  move(distance: number = 5): void {
    console.log(`${this.name} runs...`);
    super.move(distance);
  }
}

const dog = new Dog("Buddy");
dog.bark(); // 可以访问
dog.move(); // 可以访问
// dog.name; // 错误：不能在类外部访问 protected 成员
```

### TypeScript 1.4 (2014年10月)

#### 联合类型增强

```typescript
// 字符串字面量类型
type Easing = "ease-in" | "ease-out" | "ease-in-out";

class UIElement {
  animate(dx: number, dy: number, easing: Easing) {
    if (easing === "ease-in") {
      // ...
    } else if (easing === "ease-out") {
      // ...
    } else if (easing === "ease-in-out") {
      // ...
    }
  }
}

// 模板字符串
let greeting = `Hello, ${name}!`;

// 类型保护
function isFish(pet: Fish | Bird): pet is Fish {
  return (<Fish>pet).swim !== undefined;
}
```

### TypeScript 1.5 (2015年7月)

#### ES6 模块支持

```typescript
// math.ts
export function add(x: number, y: number): number {
  return x + y;
}

export function subtract(x: number, y: number): number {
  return x - y;
}

export default function multiply(x: number, y: number): number {
  return x * y;
}

// main.ts
import multiply, { add, subtract } from "./math";
import * as math from "./math";

console.log(add(1, 2)); // 3
console.log(multiply(3, 4)); // 12
console.log(math.subtract(5, 2)); // 3
```

#### 装饰器（实验性）

```typescript
// 装饰器示例（需要启用 experimentalDecorators）
function readonly(target: any, key: string, descriptor: PropertyDescriptor) {
  descriptor.writable = false;
  return descriptor;
}

class Greeter {
  greeting: string;
  
  constructor(message: string) {
    this.greeting = message;
  }
  
  @readonly
  greet() {
    return "Hello, " + this.greeting;
  }
}
```