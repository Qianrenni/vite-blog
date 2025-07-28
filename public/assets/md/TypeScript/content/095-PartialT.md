## Partial<T>

### 基本用法
```typescript
// Partial<T> 将类型 T 的所有属性变为可选
interface User {
    id: string;
    name: string;
    email: string;
    age: number;
}

// 使用 Partial 创建可选属性的类型
type PartialUser = Partial<User>;

// 等价于：
// interface PartialUser {
//     id?: string;
//     name?: string;
//     email?: string;
//     age?: number;
// }

// 实际应用
function updateUser(id: string, updates: PartialUser): void {
    console.log(`Updating user ${id} with:`, updates);
}

// 可以只提供部分属性
updateUser("123", { name: "Alice" }); // 只更新名字
updateUser("123", { email: "alice@example.com", age: 30 }); // 更新邮箱和年龄
```

### 高级用法
```typescript
// 深度 Partial（递归可选）
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface Address {
    street: string;
    city: string;
    zipCode: number;
}

interface UserWithAddress {
    id: string;
    name: string;
    address: Address;
}

type DeepPartialUser = DeepPartial<UserWithAddress>;

// 使用深度 Partial
let partialUser: DeepPartialUser = {
    name: "Alice",
    address: {
        city: "New York" // 只需要部分地址信息
    }
};

// 嵌套 Partial
type NestedPartial<T> = T extends object ? {
    [P in keyof T]?: NestedPartial<T[P]>;
} : T;

// 实际应用：配置对象
interface AppConfig {
    apiUrl: string;
    timeout: number;
    retries: number;
    debug: boolean;
}

function createApp(config: Partial<AppConfig> = {}): AppConfig {
    return {
        apiUrl: config.apiUrl || "https://api.example.com",
        timeout: config.timeout || 5000,
        retries: config.retries || 3,
        debug: config.debug || false
    };
}

let app1 = createApp(); // 使用默认配置
let app2 = createApp({ debug: true, timeout: 10000 }); // 自定义部分配置
```