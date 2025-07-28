## Pick<T,K>

### 基本用法
```typescript
// Pick<T,K> 从类型 T 中选择属性 K
interface UserFull {
    id: string;
    name: string;
    email: string;
    age: number;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

// 选择特定属性
type UserPublicInfo = Pick<UserFull, "id" | "name" | "email">;

// 等价于：
// interface UserPublicInfo {
//     id: string;
//     name: string;
//     email: string;
// }

// 实际应用
function getUserPublicInfo(user: UserFull): UserPublicInfo {
    return {
        id: user.id,
        name: user.name,
        email: user.email
    };
}

// 选择方法属性
interface ApiClient {
    get(url: string): Promise<any>;
    post(url: string, data: any): Promise<any>;
    put(url: string, data: any): Promise<any>;
    delete(url: string): Promise<any>;
    authenticate(token: string): void;
    logout(): void;
}

type ReadOperations = Pick<ApiClient, "get">;
type WriteOperations = Pick<ApiClient, "post" | "put" | "delete">;
type AuthOperations = Pick<ApiClient, "authenticate" | "logout">;
```

### 高级用法
```typescript
// 动态 Pick
type PickByType<T, U> = {
    [K in keyof T as T[K] extends U ? K : never]: T[K]
};

interface MixedTypes {
    name: string;
    age: number;
    isActive: boolean;
    score: number;
    email: string;
}

type StringProperties = PickByType<MixedTypes, string>;
// { name: string; email: string; }

type NumberProperties = PickByType<MixedTypes, number>;
// { age: number; score: number; }

type BooleanProperties = PickByType<MixedTypes, boolean>;
// { isActive: boolean; }

// 条件 Pick
type ConditionalPick<T, U> = Pick<T, {
    [K in keyof T]: T[K] extends U ? K : never
}[keyof T]>;

// 从对象数组中 Pick
interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    inStock: boolean;
}

type ProductSummary = Pick<Product, "id" | "name" | "price">;

function getProductSummaries(products: Product[]): ProductSummary[] {
    return products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price
    }));
}

// Pick 与泛型结合
function pickProperties<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
        result[key] = obj[key];
    });
    return result;
}

let user: UserFull = {
    id: "123",
    name: "Alice",
    email: "alice@example.com",
    age: 30,
    password: "secret",
    createdAt: new Date(),
    updatedAt: new Date()
};

let publicInfo = pickProperties(user, ["id", "name", "email"]);
// 类型为 Pick<UserFull, "id" | "name" | "email">
```