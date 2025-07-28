## Record<K,T>

### 基本用法
```typescript
// Record<K,T> 创建一个对象类型，其键为 K，值为 T
type UserRoles = "admin" | "user" | "guest";
type UserRolePermissions = Record<UserRoles, string[]>;

// 等价于：
// type UserRolePermissions = {
//     admin: string[];
//     user: string[];
//     guest: string[];
// }

// 实际应用
const permissions: UserRolePermissions = {
    admin: ["read", "write", "delete", "manage_users"],
    user: ["read", "write"],
    guest: ["read"]
};

// 字符串键的 Record
type StringRecord = Record<string, number>;
let scores: StringRecord = {
    "Alice": 95,
    "Bob": 87,
    "Charlie": 92
};

// 数字键的 Record
type NumberRecord = Record<number, string>;
let monthNames: NumberRecord = {
    1: "January",
    2: "February",
    3: "March"
    // ...
};
```

### 高级用法
```typescript
// Record 与映射类型结合
type ApiResponse<T> = Record<"success" | "data" | "error" | "timestamp", any> & {
    success: boolean;
     T;
    error?: string;
    timestamp: Date;
};

// 动态 Record
type DynamicRecord<T> = Record<string, T>;

function createRecord<T>(keys: string[], value: T): DynamicRecord<T> {
    const record: DynamicRecord<T> = {};
    keys.forEach(key => {
        record[key] = value;
    });
    return record;
}

let booleanFlags = createRecord(["debug", "verbose", "silent"], false);
// { debug: false, verbose: false, silent: false }

// 类型安全的配置对象
type ConfigKeys = "host" | "port" | "database" | "username";
type ConfigValues = string | number;
type AppConfig = Record<ConfigKeys, ConfigValues>;

let config: AppConfig = {
    host: "localhost",
    port: 5432,
    database: "myapp",
    username: "admin"
};

// 嵌套 Record
type NestedRecord<K extends string | number | symbol, T> = Record<K, Record<string, T>>;

type UserPreferences = NestedRecord<"theme" | "layout", string | boolean>;

let preferences: UserPreferences = {
    theme: {
        color: "dark",
        fontSize: "medium"
    },
    layout: {
        sidebar: true,
        navbar: false
    }
};
```