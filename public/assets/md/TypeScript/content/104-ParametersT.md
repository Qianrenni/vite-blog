## Parameters<T>

### 基本用法
```typescript
// Parameters<T> 获取函数类型 T 的参数类型
type Func = (name: string, age: number, isActive: boolean) => void;
type FuncParams = Parameters<Func>;

// FuncParams = [string, number, boolean]

// 实际应用
function createUser(name: string, age: number, email: string): { id: string; name: string; age: number; email: string } {
    return {
        id: Math.random().toString(36),
        name,
        age,
        email
    };
}

type CreateUserParams = Parameters<typeof createUser>;
// CreateUserParams = [string, number, string]

function callWithParams<T extends (...args: any[]) => any>(
    func: T,
    params: Parameters<T>
): ReturnType<T> {
    return func(...params);
}

let user = callWithParams(createUser, ["Alice", 30, "alice@example.com"]);

// 获取特定参数类型
type FirstParam<T> = Parameters<T>[0];
type SecondParam<T> = Parameters<T>[1];

type CreateUserFirstParam = FirstParam<typeof createUser>; // string
type CreateUserSecondParam = SecondParam<typeof createUser>; // number
```

### 高级用法
```typescript
// Parameters 与构造函数
class UserClass {
    constructor(
        public name: string,
        public age: number,
        public email?: string
    ) {}
}

type UserConstructorParams = Parameters<typeof UserClass>;
// UserConstructorParams = [string, number, (string | undefined)?]

// Parameters 与泛型函数
function genericFunc<T>(value: T, transform: (val: T) => string): string {
    return transform(value);
}

type GenericFuncParams = Parameters<typeof genericFunc>;
// GenericFuncParams = [unknown, (val: unknown) => string]

// 实际应用：函数参数验证
function validateFunctionParams<T extends (...args: any[]) => any>(
    func: T,
    ...args: Parameters<T>
): boolean {
    // 参数验证逻辑
    console.log(`Function called with ${args.length} arguments`);
    return args.length === func.length;
}

// Parameters 与重载函数
interface OverloadedFunc {
    (x: number): number;
    (x: string): string;
    (x: boolean): boolean;
}

// 注意：Parameters 只能获取最后一个重载签名的参数
type OverloadedParams = Parameters<OverloadedFunc>;
// OverloadedParams = [boolean]
```