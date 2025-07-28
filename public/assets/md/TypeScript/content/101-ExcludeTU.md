## Exclude<T,U>

### 基本用法
```typescript
// Exclude<T,U> 从类型 T 中排除可分配给 U 的类型
type Status = "pending" | "approved" | "rejected" | "draft";
type ActiveStatus = Exclude<Status, "draft">;

// ActiveStatus = "pending" | "approved" | "rejected"

// 排除数字类型
type Numbers = 1 | 2 | 3 | 4 | 5;
type EvenNumbers = Exclude<Numbers, 1 | 3 | 5>;

// EvenNumbers = 2 | 4

// 排除字符串类型
type Colors = "red" | "green" | "blue" | "yellow" | "purple";
type PrimaryColors = Exclude<Colors, "yellow" | "purple">;

// PrimaryColors = "red" | "green" | "blue"

// 实际应用
interface Task {
    id: string;
    title: string;
    status: Status;
    assignee?: string;
}

function updateTaskStatus(task: Task, newStatus: Exclude<Status, "draft">): void {
    task.status = newStatus;
}

let task: Task = {
    id: "123",
    title: "Implement feature",
    status: "pending"
};

// updateTaskStatus(task, "draft"); // 错误！"draft" 被排除了
updateTaskStatus(task, "approved"); // 正确
```

### 高级用法
```typescript
// Exclude 与联合类型
type Primitive = string | number | boolean | null | undefined;
type NonNullablePrimitive = Exclude<Primitive, null | undefined>;

// NonNullablePrimitive = string | number | boolean

// Exclude 与字符串字面量类型
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
type MutatingMethods = Exclude<HttpMethod, "GET" | "HEAD" | "OPTIONS">;

// MutatingMethods = "POST" | "PUT" | "DELETE" | "PATCH"

// 实际应用：API 客户端
class ApiClient {
    async request<T>(
        method: Exclude<HttpMethod, "HEAD" | "OPTIONS">,
        url: string,
        data?: any
    ): Promise<T> {
        // 实现请求逻辑
        return {} as T;
    }
}

// Exclude 与泛型
type Diff<T, U> = T extends U ? never : T;

type Letters = "a" | "b" | "c" | "d" | "e";
type Vowels = "a" | "e";
type Consonants = Diff<Letters, Vowels>;

// Consonants = "b" | "c" | "d"

// 条件 Exclude
type ConditionalExclude<T, U> = T extends U ? never : T;

// 排除特定模式的字符串
type RoutePaths = "/users" | "/users/:id" | "/admin" | "/admin/settings" | "/api/*";
type PublicRoutes = Exclude<RoutePaths, "/admin" | "/admin/settings">;

// PublicRoutes = "/users" | "/users/:id" | "/api/*"
```