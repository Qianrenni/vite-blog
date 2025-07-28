## 1. 混入（Mixins）

混入是一种在不使用继承的情况下向类添加功能的模式。

### 基础混入实现

```typescript
// 定义混入函数的类型
type Constructor<T = {}> = new (...args: any[]) => T;

// 混入示例：时间戳功能
function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    timestamp = Date.now();
    
    getTimestamp(): number {
      return this.timestamp;
    }
    
    updateTimestamp(): void {
      this.timestamp = Date.now();
    }
  };
}

// 混入示例：激活状态功能
function Activatable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    isActive = false;
    
    activate(): void {
      this.isActive = true;
    }
    
    deactivate(): void {
      this.isActive = false;
    }
  };
}

// 混入示例：可验证功能
function Validatable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    errors: string[] = [];
    
    addError(error: string): void {
      this.errors.push(error);
    }
    
    clearErrors(): void {
      this.errors = [];
    }
    
    isValid(): boolean {
      return this.errors.length === 0;
    }
    
    getErrors(): string[] {
      return [...this.errors];
    }
  };
}

// 使用混入创建类
class User {
  constructor(
    public name: string,
    public email: string
  ) {}
  
  getName(): string {
    return this.name;
  }
}

// 应用多个混入
const TimestampedUser = Timestamped(User);
const ActivatableTimestampedUser = Activatable(TimestampedUser);
const FullyFeaturedUser = Validatable(ActivatableTimestampedUser);

// 创建实例
const user = new FullyFeaturedUser("Alice", "alice@example.com");

// 使用混入的功能
console.log(user.getName()); // Alice
console.log(user.getTimestamp()); // 时间戳
user.activate();
console.log(user.isActive); // true
user.addError("Invalid email format");
console.log(user.isValid()); // false
console.log(user.getErrors()); // ["Invalid email format"]
```

### 复杂混入示例

```typescript
// 通用混入工厂
function createMixin<T extends Record<string, any>>(mixin: T) {
  return <TBase extends Constructor>(Base: TBase) => {
    return class extends Base {
      constructor(...args: any[]) {
        super(...args);
        Object.assign(this, mixin);
      }
    } as Constructor<T & InstanceType<TBase>>;
  };
}

// 数据持久化混入
interface Persistence {
  save(): Promise<void>;
  load(): Promise<void>;
  delete(): Promise<void>;
}

function Persistable<TBase extends Constructor>(Base: TBase) {
  return class extends Base implements Persistence {
    private storageKey: string;
    
    constructor(...args: any[]) {
      super(...args);
      this.storageKey = this.constructor.name + '_' + Date.now();
    }
    
    async save(): Promise<void> {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this));
      }
    }
    
    async load(): Promise<void> {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(this.storageKey);
        if (data) {
          Object.assign(this, JSON.parse(data));
        }
      }
    }
    
    async delete(): Promise<void> {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.storageKey);
      }
    }
  };
}

// 日志记录混入
function Loggable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    private logHistory: string[] = [];
    
    protected log(message: string): void {
      const logEntry = `[${new Date().toISOString()}] ${message}`;
      this.logHistory.push(logEntry);
      console.log(logEntry);
    }
    
    getLogHistory(): string[] {
      return [...this.logHistory];
    }
  };
}

// 使用多个混入
class Product {
  constructor(
    public id: number,
    public name: string,
    public price: number
  ) {}
  
  getFormattedPrice(): string {
    return `$${this.price.toFixed(2)}`;
  }
}

// 应用混入
const EnhancedProduct = Loggable(Persistable(Product));

const product = new EnhancedProduct(1, "Laptop", 999.99);
product.log(`Product created: ${product.name}`);
await product.save();

console.log(product.getLogHistory());
```

### 混入类型约束

```typescript
// 带类型约束的混入
function WithId<TBase extends Constructor<{ id: number }>>(Base: TBase) {
  return class extends Base {
    getId(): number {
      return this.id;
    }
    
    setId(id: number): void {
      this.id = id;
    }
  };
}

// 带泛型参数的混入
function WithCollection<T, TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    private items: T[] = [];
    
    addItem(item: T): void {
      this.items.push(item);
    }
    
    removeItem(item: T): void {
      const index = this.items.indexOf(item);
      if (index > -1) {
        this.items.splice(index, 1);
      }
    }
    
    getItems(): T[] {
      return [...this.items];
    }
    
    getItemCount(): number {
      return this.items.length;
    }
  };
}

// 使用泛型混入
class Container {
  name: string;
  
  constructor(name: string) {
    this.name = name;
  }
}

const CollectionContainer = WithCollection<string>(Container);
const container = new CollectionContainer("My Container");
container.addItem("item1");
container.addItem("item2");
console.log(container.getItems()); // ["item1", "item2"]
```