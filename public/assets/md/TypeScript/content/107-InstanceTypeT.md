## InstanceType<T>

### 基本用法
```typescript
// InstanceType<T> 获取构造函数类型 T 的实例类型
class User2 {
    constructor(
        public id: string,
        public name: string,
        public email: string
    ) {}
    
    greet(): string {
        return `Hello, ${this.name}!`;
    }
}

type UserInstance = InstanceType<typeof User2>;
// UserInstance = User2

// 实际应用
function createInstance<T extends new (...args: any[]) => any>(
    Constructor: T,
    ...args: ConstructorParameters<T>
): InstanceType<T> {
    return new Constructor(...args);
}

let user = createInstance(User2, "123", "Alice", "alice@example.com");
// user 的类型是 User2

// 与抽象类结合
abstract class BaseRepository2<T> {
    abstract findById(id: string): T | null;
    abstract save(entity: T): void;
}

class UserRepository2 extends BaseRepository2<User2> {
    findById(id: string): User2 | null {
        return new User2(id, "Default", "default@example.com");
    }
    
    save(entity: User2): void {
        console.log(`Saving user ${entity.id}`);
    }
}

type RepositoryInstance<T extends typeof BaseRepository2> = InstanceType<T>;

// 实际应用：工厂模式
interface IProduct {
    name: string;
    price: number;
}

class Book implements IProduct {
    constructor(public name: string, public price: number, public author: string) {}
}

class Electronics implements IProduct {
    constructor(public name: string, public price: number, public brand: string) {}
}

type ProductConstructors = typeof Book | typeof Electronics;
type ProductInstance = InstanceType<ProductConstructors>;

function createProduct<T extends ProductConstructors>(
    Constructor: T,
    ...args: ConstructorParameters<T>
): InstanceType<T> {
    return new Constructor(...args);
}

let book = createProduct(Book, "TypeScript Guide", 29.99, "John Doe");
let electronics = createProduct(Electronics, "Laptop", 999.99, "TechCorp");
```

### 高级用法
```typescript
// InstanceType 与泛型类
class GenericService<T> {
    constructor(private data: T[]) {}
    
    find(predicate: (item: T) => boolean): T | undefined {
        return this.data.find(predicate);
    }
    
    add(item: T): void {
        this.data.push(item);
    }
}

type ServiceInstance<T> = InstanceType<typeof GenericService<T>>;
// 注意：这种方式在实际使用中有限制

// 实际应用：依赖注入容器改进版
class DIContainer {
    private services = new Map<any, { constructor: any; args: any[] }>();
    
    register<T extends new (...args: any[]) => any>(
        token: T,
        ...args: ConstructorParameters<T>
    ): void {
        this.services.set(token, { constructor: token, args });
    }
    
    resolve<T extends new (...args: any[]) => any>(token: T): InstanceType<T> {
        const serviceInfo = this.services.get(token);
        if (!serviceInfo) {
            throw new Error(`Service ${token.name} not registered`);
        }
        
        return new serviceInfo.constructor(...serviceInfo.args);
    }
    
    // 批量解析
    resolveAll<T extends (new (...args: any[]) => any)[]>(
        tokens: [...T]
    ): { [K in keyof T]: InstanceType<T[K]> } {
        return tokens.map(token => this.resolve(token)) as any;
    }
}

// 使用示例
class Logger2 {
    constructor(private level: string = "info") {}
    log(message: string) { console.log(`[${this.level}] ${message}`); }
}

class Database2 {
    constructor(private connectionString: string) {}
    connect() { console.log(`Connecting to ${this.connectionString}`); }
}

let container = new DIContainer();
container.register(Logger2, "debug");
container.register(Database2, "postgresql://localhost:5432/mydb");

let logger = container.resolve(Logger2);
let database = container.resolve(Database2);

// 批量解析
let [logger2, database2] = container.resolveAll([Logger2, Database2]);
```