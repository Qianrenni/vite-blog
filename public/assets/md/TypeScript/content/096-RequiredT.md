## Required<T>

### 基本用法
```typescript
// Required<T> 将类型 T 的所有属性变为必需
interface UserOptional {
    id?: string;
    name?: string;
    email?: string;
    age?: number;
}

// 使用 Required 创建必需属性的类型
type RequiredUser = Required<UserOptional>;

// 等价于：
// interface RequiredUser {
//     id: string;
//     name: string;
//     email: string;
//     age: number;
// }

// 实际应用
function validateUser(user: RequiredUser): boolean {
    return user.id.length > 0 && 
           user.name.length > 0 && 
           user.email.length > 0 && 
           user.age > 0;
}

// 从可选对象创建必需对象
let optionalUser: UserOptional = {
    id: "123",
    name: "Alice"
    // email 和 age 是可选的
};

// 需要确保所有属性都存在
let requiredUser: RequiredUser = {
    id: optionalUser.id!,
    name: optionalUser.name!,
    email: optionalUser.email || "",
    age: optionalUser.age || 0
};
```

### 高级用法
```typescript
// 深度 Required（递归必需）
type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

interface OptionalUserWithAddress {
    id?: string;
    name?: string;
    address?: {
        street?: string;
        city?: string;
        zipCode?: number;
    };
}

type DeepRequiredUser = DeepRequired<OptionalUserWithAddress>;

// 使用深度 Required
let requiredUserWithAddress: DeepRequiredUser = {
    id: "123",
    name: "Alice",
    address: {
        street: "123 Main St",
        city: "New York",
        zipCode: 10001
    }
};

// 条件 Required
type ConditionalRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

interface PartialConfig {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
}

// 要求 host 和 port 必需
type RequiredHostPort = ConditionalRequired<PartialConfig, "host" | "port">;

let config: RequiredHostPort = {
    host: "localhost",  // 必需
    port: 3000,         // 必需
    username: "admin",  // 可选
    password: "secret"  // 可选
};
```