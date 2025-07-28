## Readonly<T>

### 基本用法
```typescript
// Readonly<T> 将类型 T 的所有属性变为只读
interface UserMutable {
    id: string;
    name: string;
    email: string;
    age: number;
}

// 使用 Readonly 创建只读类型
type ReadonlyUser = Readonly<UserMutable>;

// 等价于：
// interface ReadonlyUser {
//     readonly id: string;
//     readonly name: string;
//     readonly email: string;
//     readonly age: number;
// }

// 实际应用
function processUser(user: ReadonlyUser): string {
    // 可以读取属性
    console.log(`Processing user: ${user.name}`);
    
    // 不能修改属性
    // user.name = "New Name"; // 错误！
    
    return `Processed: ${user.name} (${user.email})`;
}

let user: UserMutable = {
    id: "123",
    name: "Alice",
    email: "alice@example.com",
    age: 30
};

let readonlyUser: ReadonlyUser = user; // 可以赋值
console.log(processUser(readonlyUser));
```

### 高级用法
```typescript
// 深度 Readonly（递归只读）
type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

interface UserWithNestedData {
    id: string;
    name: string;
    preferences: {
        theme: string;
        language: string;
        notifications: {
            email: boolean;
            push: boolean;
        };
    };
}

type DeepReadonlyUser = DeepReadonly<UserWithNestedData>;

// 使用深度 Readonly
let readonlyUserWithNested: DeepReadonlyUser = {
    id: "123",
    name: "Alice",
    preferences: {
        theme: "dark",
        language: "en",
        notifications: {
            email: true,
            push: false
        }
    }
};

// 不能修改任何属性
// readonlyUserWithNested.id = "456"; // 错误！
// readonlyUserWithNested.preferences.theme = "light"; // 错误！
// readonlyUserWithNested.preferences.notifications.email = false; // 错误！
```