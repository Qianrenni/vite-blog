## ReturnType<T>

### 基本用法
```typescript
// ReturnType<T> 获取函数类型 T 的返回类型
function getUser(id: string): { id: string; name: string; email: string } {
    return {
        id,
        name: "Default User",
        email: "default@example.com"
    };
}

type GetUserReturnType = ReturnType<typeof getUser>;
// GetUserReturnType = { id: string; name: string; email: string }

// 实际应用
async function fetchUserData(id: string): Promise<{ id: string; name: string; email: string }> {
    // 模拟 API 调用
    return {
        id,
        name: "Fetched User",
        email: "fetched@example.com"
    };
}

type FetchUserReturnType = ReturnType<typeof fetchUserData>;
// FetchUserReturnType = Promise<{ id: string; name: string; email: string }>

type FetchUserResolvedType = Awaited<FetchUserReturnType>;
// FetchUserResolvedType = { id: string; name: string; email: string }

// 与泛型函数结合
function identity<T>(value: T): T {
    return value;
}

type IdentityReturnType = ReturnType<typeof identity>;
// IdentityReturnType = unknown (因为 T 是泛型参数)

// 实际应用：API 响应处理
interface ApiResponse<T> {
    success: boolean;
     T;
    message?: string;
}

async function apiCall<T>(endpoint: string): Promise<ApiResponse<T>> {
    // 实现 API 调用
    return {
        success: true,
         data: {} as T
    };
}

type ApiCallReturnType<T> = ReturnType<typeof apiCall<T>>;
// ApiCallReturnType<T> = Promise<ApiResponse<T>>
```

### 高级用法
```typescript
// ReturnType 与重载函数
function processValue(value: string): string;
function processValue(value: number): number;
function processValue(value: boolean): boolean;
function processValue(value: string | number | boolean): string | number | boolean {
    return value;
}

type ProcessValueReturnType = ReturnType<typeof processValue>;
// ProcessValueReturnType = boolean (最后一个重载签名的返回类型)

// ReturnType 与条件类型结合
type Unpromisify<T> = T extends Promise<infer U> ? U : T;

function asyncFunction(): Promise<string> {
    return Promise.resolve("hello");
}

type AsyncFunctionReturnType = ReturnType<typeof asyncFunction>;
// AsyncFunctionReturnType = Promise<string>

type UnpromisifiedReturnType = Unpromisify<ReturnType<typeof asyncFunction>>;
// UnpromisifiedReturnType = string

// 实际应用：函数结果缓存
class ResultCache {
    private cache = new Map<string, any>();
    
    getCachedResult<T extends (...args: any[]) => any>(
        key: string,
        func: T,
        ...args: Parameters<T>
    ): ReturnType<T> {
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        
        const result = func(...args);
        this.cache.set(key, result);
        return result;
    }
}

let cache = new ResultCache();
let result = cache.getCachedResult("user-123", getUser, "123");
// result 的类型是 ReturnType<typeof getUser>
```