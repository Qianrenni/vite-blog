## Omit<T,K>

### 基本用法
```typescript
// Omit<T,K> 从类型 T 中排除属性 K
interface UserComplete {
    id: string;
    name: string;
    email: string;
    password: string;
    ssn: string;
    creditCard: string;
    createdAt: Date;
    updatedAt: Date;
}

// 排除敏感信息
type UserSafe = Omit<UserComplete, "password" | "ssn" | "creditCard">;

// 等价于：
// interface UserSafe {
//     id: string;
//     name: string;
//     email: string;
//     createdAt: Date;
//     updatedAt: Date;
// }

// 实际应用
function sanitizeUser(user: UserComplete): UserSafe {
    const { password, ssn, creditCard, ...safeUser } = user;
    return safeUser;
}

// 排除方法
interface DatabaseConnection {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query(sql: string): Promise<any>;
    execute(sql: string): Promise<any>;
    getConnectionInfo(): string;
    getPassword(): string; // 敏感方法
    setPassword(password: string): void; // 敏感方法
}

type SafeDatabaseConnection = Omit<DatabaseConnection, "getPassword" | "setPassword">;

// 排除多个属性
type UserWithoutTimestamps = Omit<UserComplete, "createdAt" | "updatedAt">;
type UserBasicInfo = Omit<UserComplete, "password" | "ssn" | "creditCard" | "createdAt" | "updatedAt">;
```

### 高级用法
```typescript
// 动态 Omit
type OmitByType<T, U> = {
    [K in keyof T as T[K] extends U ? never : K]: T[K]
};

interface MixedData {
    name: string;
    age: number;
    email: string;
    password: string;
    callback: () => void;
    data: any;
}

type WithoutFunctions = OmitByType<MixedData, Function>;
// { name: string; age: number; email: string; password: string; data: any; }

type WithoutStrings = OmitByType<MixedData, string>;
// { age: number; callback: () => void; data: any; }

// 条件 Omit
type ConditionalOmit<T, U> = Omit<T, {
    [K in keyof T]: T[K] extends U ? K : never
}[keyof T]>;

// 递归 Omit
type DeepOmit<T, K extends string> = {
    [P in keyof T as P extends K ? never : P]: T[P] extends object ? DeepOmit<T[P], K> : T[P];
};

interface NestedUser {
    id: string;
    name: string;
    profile: {
        email: string;
        password: string;
        settings: {
            theme: string;
            password: string; // 嵌套的敏感信息
        };
    };
}

type SafeNestedUser = DeepOmit<NestedUser, "password">;
// 递归移除所有 password 属性

// Omit 与 Pick 组合
type UserPublicProfile = Pick<Omit<UserComplete, "password" | "ssn" | "creditCard">, "id" | "name" | "email">;
```