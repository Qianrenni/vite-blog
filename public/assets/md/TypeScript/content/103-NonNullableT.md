## NonNullable<T>

### 基本用法
```typescript
// NonNullable<T> 从类型 T 中排除 null 和 undefined
type NullableString = string | null | undefined;
type NonNullString = NonNullable<NullableString>;

// NonNullString = string

type MixedNullable = string | number | null | undefined;
type NonNullMixed = NonNullable<MixedNullable>;

// NonNullMixed = string | number

// 实际应用
function processString(value: NullableString): string {
    // 需要类型守卫
    if (value === null || value === undefined) {
        return "default";
    }
    
    // 现在 value 是 string 类型
    return value.toUpperCase();
}

// 使用 NonNullable 简化类型
function processString2(value: NonNullable<NullableString>): string {
    // value 已经是非空的
    return value.toUpperCase();
}

// 处理数组中的可空值
type NullableArray = (string | null | undefined)[];
type NonNullArray = NonNullable<NullableArray>[number][];

// NonNullArray = string[]

function filterNonNull(array: NullableArray): string[] {
    return array.filter((item): item is NonNullable<typeof item> => 
        item !== null && item !== undefined
    ) as string[];
}
```

### 高级用法
```typescript
// NonNullable 与泛型
function compact<T>(array: T[]): NonNullable<T>[] {
    return array.filter((item): item is NonNullable<T> => 
        item !== null && item !== undefined
    ) as NonNullable<T>[];
}

let mixedArray = ["hello", null, "world", undefined, 42, null];
let compacted = compact(mixedArray); // (string | number)[]

// NonNullable 与对象属性
interface UserWithOptionalFields {
    id: string;
    name: string;
    email: string | null;
    phone: string | undefined;
    address: string | null | undefined;
}

type RequiredUserFields = {
    [K in keyof UserWithOptionalFields]: NonNullable<UserWithOptionalFields[K]>
};

// RequiredUserFields = {
//     id: string;
//     name: string;
//     email: string;
//     phone: string;
//     address: string;
// }

// 实际应用：数据库查询结果处理
interface DatabaseResult {
    id: number;
    name: string | null;
    email: string | null;
    created_at: string;
}

function sanitizeDatabaseResult(result: DatabaseResult): NonNullable<DatabaseResult> {
    return {
        id: result.id,
        name: result.name || "Unknown",
        email: result.email || "no-email@example.com",
        created_at: result.created_at
    };
}
```