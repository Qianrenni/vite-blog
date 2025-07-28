## ThisType<T>

### 基本用法
```typescript
// ThisType<T> 为对象字面量提供 this 类型
// 需要在 tsconfig.json 中设置 "noImplicitThis": true

interface User5 {
    name: string;
    age: number;
}

interface UserMethods {
    getName(): string;
    getAge(): number;
    greet(): string;
}

let userObject: User5 & ThisType<User5 & UserMethods> = {
    name: "Alice",
    age: 30,
    
    getName() {
        return this.name; // this 的类型是 User5 & UserMethods
    },
    
    getAge() {
        return this.age; // this 的类型是 User5 & UserMethods
    },
    
    greet() {
        return `Hello, ${this.getName()}! You are ${this.getAge()} years old.`;
    }
};

console.log(userObject.greet()); // "Hello, Alice! You are 30 years old."
```

### 高级用法
```typescript
// ThisType 与 fluent API
interface Calculator {
    value: number;
    add(x: number): this;
    multiply(x: number): this;
    subtract(x: number): this;
    divide(x: number): this;
    result(): number;
}

let calculator: Calculator & ThisType<Calculator> = {
    value: 0,
    
    add(x: number) {
        this.value += x;
        return this; // this 的类型是 Calculator
    },
    
    multiply(x: number) {
        this.value *= x;
        return this;
    },
    
    subtract(x: number) {
        this.value -= x;
        return this;
    },
    
    divide(x: number) {
        this.value /= x;
        return this;
    },
    
    result() {
        return this.value;
    }
};

let result = calculator.add(5).multiply(2).subtract(3).divide(2).result();
console.log(result); // 3.5

// ThisType 与配置对象
interface ConfigBuilder<T> {
    set<K extends keyof T>(key: K, value: T[K]): this;
    get<K extends keyof T>(key: K): T[K];
    build(): T;
}

interface AppConfig {
    host: string;
    port: number;
    debug: boolean;
}

let configBuilder: ConfigBuilder<AppConfig> & ThisType<ConfigBuilder<AppConfig>> = {
    host: "localhost",
    port: 3000,
    debug: false,
    
    set(key, value) {
        this[key] = value;
        return this;
    },
    
    get(key) {
        return this[key];
    },
    
    build() {
        return {
            host: this.host,
            port: this.port,
            debug: this.debug
        };
    }
};

let config = configBuilder.set("host", "0.0.0.0").set("port", 8080).build();
console.log(config); // { host: "0.0.0.0", port: 8080, debug: false }

// ThisType 与插件系统
interface PluginAPI {
    register(name: string, handler: Function): void;
    execute(name: string, ...args: any[]): any;
}

interface PluginContext {
    api: PluginAPI;
    config: any;
    utils: {
        log(message: string): void;
        error(error: string): void;
    };
}

let pluginContext: PluginContext & ThisType<PluginContext> = {
    api: {
        register(name: string, handler: Function) { /* ... */ },
        execute(name: string, ...args: any[]) { /* ... */ }
    },
    
    config: {},
    
    utils: {
        log(message: string) {
            console.log(`[LOG] ${message}`);
        },
        
        error(error: string) {
            console.error(`[ERROR] ${error}`);
        }
    },
    
    // 插件方法可以访问 this
    initialize() {
        this.utils.log("Plugin initialized");
        this.api.register("test", () => "Hello from plugin");
    }
};
```