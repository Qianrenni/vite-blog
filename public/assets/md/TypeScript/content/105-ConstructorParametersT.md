## ConstructorParameters<T>

### 基本用法
```typescript
// ConstructorParameters<T> 获取构造函数类型 T 的参数类型
class DatabaseConnection {
    constructor(
        public host: string,
        public port: number,
        public username: string,
        public password?: string
    ) {}
}

type ConnectionParams = ConstructorParameters<typeof DatabaseConnection>;
// ConnectionParams = [string, number, string, (string | undefined)?]

// 实际应用
function createConnection(
    ...args: ConstructorParameters<typeof DatabaseConnection>
): DatabaseConnection {
    return new DatabaseConnection(...args);
}

let connection1 = createConnection("localhost", 5432, "admin", "secret");
let connection2 = createConnection("localhost", 5432, "admin"); // 可选参数

// 与类工厂函数结合
class User {
    constructor(
        public id: string,
        public name: string,
        public email: string
    ) {}
}

function createUserFactory<T extends new (...args: any[]) => any>(
    Constructor: T,
    ...args: ConstructorParameters<T>
): InstanceType<T> {
    return new Constructor(...args);
}

let user = createUserFactory(User, "123", "Alice", "alice@example.com");
```

### 高级用法
```typescript
// ConstructorParameters 与抽象类
abstract class BaseRepository<T> {
    constructor(
        protected tableName: string,
        protected primaryKey: string = "id"
    ) {}
}

class UserRepository extends BaseRepository<User> {
    constructor(tableName: string = "users") {
        super(tableName);
    }
}

type BaseRepoParams = ConstructorParameters<typeof BaseRepository>;
// BaseRepoParams = [string, string?]

type UserRepoParams = ConstructorParameters<typeof UserRepository>;
// UserRepoParams = [string?] (因为有默认参数)

// ConstructorParameters 与泛型类
class GenericRepository<T> {
    constructor(
        private entityType: new () => T,
        private tableName: string
    ) {}
}

type GenericRepoParams = ConstructorParameters<typeof GenericRepository>;
// GenericRepoParams = [new () => unknown, string]

// 实际应用：依赖注入容器
interface Injectable {
    new (...args: any[]): any;
}

class Container {
    private services = new Map<any, any>();
    
    register<T extends Injectable>(
        token: T,
        ...args: ConstructorParameters<T>
    ): void {
        this.services.set(token, args);
    }
    
    resolve<T extends Injectable>(token: T): InstanceType<T> {
        const args = this.services.get(token) || [];
        return new token(...args);
    }
}

// 使用示例
class Logger {
    constructor(private level: string = "info") {}
}

class Database {
    constructor(private connectionString: string) {}
}

let container = new Container();
container.register(Logger, "debug");
container.register(Database, "postgresql://localhost:5432/mydb");
```