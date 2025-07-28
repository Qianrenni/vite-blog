## ThisParameterType<T>

### 基本用法
```typescript
// ThisParameterType<T> 提取函数类型 T 的 this 参数类型
interface User3 {
    id: string;
    name: string;
}

function getUserInfo(this: User3): string {
    return `${this.name} (${this.id})`;
}

type UserInfoThisType = ThisParameterType<typeof getUserInfo>;
// UserInfoThisType = User3

// 实际应用
class UserService3 {
    private users: User3[] = [];
    
    addUser(this: UserService3, user: User3): void {
        this.users.push(user);
    }
    
    findUser(this: UserService3, id: string): User3 | undefined {
        return this.users.find(u => u.id === id);
    }
}

type AddUserThisType = ThisParameterType<UserService3['addUser']>;
// AddUserThisType = UserService3

type FindUserThisType = ThisParameterType<UserService3['findUser']>;
// FindUserThisType = UserService3

// 与 bind 结合使用
let service = new UserService3();
let boundAddUser = service.addUser.bind(service);

type BoundAddUserThisType = ThisParameterType<typeof boundAddUser>;
// BoundAddUserThisType = UserService3
```

### 高级用法
```typescript
// ThisParameterType 与方法装饰器
function logMethodCalls<T>(
    target: T,
    methodName: string,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => any>
): void {
    const originalMethod = descriptor.value;
    
    if (originalMethod) {
        descriptor.value = function (...args: any[]) {
            const thisType = ThisParameterType<typeof originalMethod>;
            console.log(`Calling ${methodName} on ${target.constructor.name}`);
            return originalMethod.apply(this, args);
        };
    }
}

// ThisParameterType 与事件处理器
interface Component {
    state: any;
    update(): void;
}

function handleClick(this: Component, event: MouseEvent): void {
    console.log('Component clicked');
    this.update();
}

type ComponentClickHandler = ThisParameterType<typeof handleClick>;
// ComponentClickHandler = Component

// 实际应用：类型安全的事件绑定
class EventManager {
    bind<T extends (this: any, ...args: any[]) => any>(
        element: HTMLElement,
        event: string,
        handler: T,
        context: ThisParameterType<T>
    ): void {
        element.addEventListener(event, handler.bind(context));
    }
}

let manager = new EventManager();
let component: Component = {
    state: {},
    update() { console.log('Component updated'); }
};

// manager.bind(button, 'click', handleClick, component);
```