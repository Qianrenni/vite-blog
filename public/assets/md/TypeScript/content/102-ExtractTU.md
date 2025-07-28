## Extract<T,U>

### 基本用法
```typescript
// Extract<T,U> 从类型 T 中提取可分配给 U 的类型
type Status2 = "pending" | "approved" | "rejected" | "draft";
type CompletedStatus = Extract<Status2, "approved" | "rejected">;

// CompletedStatus = "approved" | "rejected"

// 提取数字类型
type Numbers2 = 1 | 2 | 3 | 4 | 5;
type OddNumbers = Extract<Numbers2, 1 | 3 | 5>;

// OddNumbers = 1 | 3 | 5

// 提取字符串类型
type Colors2 = "red" | "green" | "blue" | "yellow" | "purple";
type WarmColors = Extract<Colors2, "red" | "yellow" | "orange">;

// WarmColors = "red" | "yellow" (orange 不在原联合类型中)

// 实际应用
interface Order {
    id: string;
    status: Status2;
    total: number;
}

function processCompletedOrders(orders: Order[]): Order[] {
    return orders.filter(order => 
        Extract<Status2, "approved" | "rejected">(order.status as any)
    );
}

// 更好的实现方式
function isCompletedStatus(status: Status2): status is Extract<Status2, "approved" | "rejected"> {
    return status === "approved" || status === "rejected";
}

function processCompletedOrders2(orders: Order[]): Order[] {
    return orders.filter(order => isCompletedStatus(order.status));
}
```

### 高级用法
```typescript
// Extract 与字符串操作
type FileExtensions = ".js" | ".ts" | ".jsx" | ".tsx" | ".css" | ".scss";
type TypeScriptExtensions = Extract<FileExtensions, ".ts" | ".tsx">;

// TypeScriptExtensions = ".ts" | ".tsx"

// 提取函数类型
type MixedTypes2 = string | number | (() => void) | ((x: number) => string);
type FunctionTypes = Extract<MixedTypes2, Function>;

// FunctionTypes = (() => void) | ((x: number) => string)

// 实际应用：类型守卫
function isFunctionType<T>(value: T): value is Extract<T, Function> {
    return typeof value === "function";
}

// Extract 与条件类型
type Filter<T, U> = T extends U ? T : never;

type StringOrNumber = string | number | boolean;
type StringTypes = Filter<StringOrNumber, string>;

// StringTypes = string

// 提取特定属性名
type StringKeys<T> = Extract<keyof T, string>;

interface MixedKeys {
    name: string;
    0: number;
    [Symbol.iterator]: () => Iterator<any>;
}

type StringKeyNames = StringKeys<MixedKeys>;
// StringKeyNames = "name"
```