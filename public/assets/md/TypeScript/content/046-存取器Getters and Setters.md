## 存取器（Getters and Setters）

### 基本存取器
```typescript
// 基本存取器
class Employee {
    private _firstName: string;
    private _lastName: string;
    private _salary: number;
    
    constructor(firstName: string, lastName: string, salary: number) {
        this._firstName = firstName;
        this._lastName = lastName;
        this._salary = salary;
    }
    
    // Getter
    get firstName(): string {
        return this._firstName;
    }
    
    // Setter
    set firstName(value: string) {
        if (value.length === 0) {
            throw new Error("First name cannot be empty");
        }
        this._firstName = value;
    }
    
    // 只读 getter
    get fullName(): string {
        return `${this._firstName} ${this._lastName}`;
    }
    
    // Getter 和 Setter 配对
    get salary(): number {
        return this._salary;
    }
    
    set salary(value: number) {
        if (value < 0) {
            throw new Error("Salary cannot be negative");
        }
        this._salary = value;
    }
    
    // 计算属性
    get annualSalary(): number {
        return this._salary * 12;
    }
}

let employee = new Employee("John", "Doe", 5000);
console.log(employee.firstName); // "John"
console.log(employee.fullName); // "John Doe"
console.log(employee.annualSalary); // 60000

employee.firstName = "Jane";
employee.salary = 6000;
console.log(employee.fullName); // "Jane Doe"
console.log(employee.annualSalary); // 72000

// employee.firstName = ""; // 抛出错误
// employee.salary = -1000; // 抛出错误
```

### 复杂存取器示例
```typescript
// 复杂存取器示例
class Temperature {
    private _celsius: number;
    
    constructor(celsius: number) {
        this._celsius = celsius;
    }
    
    // 摄氏度存取器
    get celsius(): number {
        return this._celsius;
    }
    
    set celsius(value: number) {
        if (value < -273.15) {
            throw new Error("Temperature cannot be below absolute zero");
        }
        this._celsius = value;
    }
    
    // 华氏度存取器
    get fahrenheit(): number {
        return (this._celsius * 9/5) + 32;
    }
    
    set fahrenheit(value: number) {
        if (value < -459.67) {
            throw new Error("Temperature cannot be below absolute zero");
        }
        this._celsius = (value - 32) * 5/9;
    }
    
    // 开尔文存取器
    get kelvin(): number {
        return this._celsius + 273.15;
    }
    
    set kelvin(value: number) {
        if (value < 0) {
            throw new Error("Temperature cannot be below absolute zero");
        }
        this._celsius = value - 273.15;
    }
    
    // 格式化显示
    get formatted(): string {
        return `${this._celsius}°C (${this.fahrenheit.toFixed(1)}°F)`;
    }
}

let temp = new Temperature(25);
console.log(temp.formatted); // "25°C (77.0°F)"

temp.fahrenheit = 100;
console.log(temp.celsius); // 37.777...
console.log(temp.formatted); // "37.8°C (100.0°F)"

temp.kelvin = 0;
console.log(temp.celsius); // -273.15
// temp.celsius = -300; // 抛出错误
```

### 存取器与验证
```typescript
// 存取器与数据验证
class User {
    private _email: string = "";
    private _age: number = 0;
    private _password: string = "";
    
    // Email 验证存取器
    get email(): string {
        return this._email;
    }
    
    set email(value: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            throw new Error("Invalid email format");
        }
        this._email = value.toLowerCase();
    }
    
    // 年龄验证存取器
    get age(): number {
        return this._age;
    }
    
    set age(value: number) {
        if (value < 0 || value > 150) {
            throw new Error("Age must be between 0 and 150");
        }
        this._age = value;
    }
    
    // 密码安全存取器
    get password(): string {
        return "*".repeat(this._password.length);
    }
    
    set password(value: string) {
        if (value.length < 8) {
            throw new Error("Password must be at least 8 characters long");
        }
        if (!/[A-Z]/.test(value)) {
            throw new Error("Password must contain at least one uppercase letter");
        }
        if (!/[0-9]/.test(value)) {
            throw new Error("Password must contain at least one digit");
        }
        this._password = value;
    }
    
    // 只读属性
    get isAdult(): boolean {
        return this._age >= 18;
    }
    
    // 计算属性
    get securityScore(): number {
        let score = 0;
        if (this._password.length >= 12) score += 30;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(this._password)) score += 20;
        if (/[a-z]/.test(this._password) && /[A-Z]/.test(this._password)) score += 20;
        return Math.min(score, 100);
    }
}

let user = new User();
try {
    user.email = "user@example.com";
    user.age = 25;
    user.password = "MySecurePass123!";
    
    console.log(user.email); // "user@example.com"
    console.log(user.password); // "*************"
    console.log(user.isAdult); // true
    console.log(user.securityScore); // 70
} catch (error) {
    console.error(error.message);
}
```

### 存取器与惰性初始化
```typescript
// 存取器与惰性初始化
class ExpensiveObject {
    private _data: string[] | null = null;
    private _computedValue: number | null = null;
    
    // 惰性初始化数据
    get data(): string[] {
        if (this._data === null) {
            console.log("Initializing expensive data...");
            // 模拟昂贵的计算或数据获取
            this._data = Array.from({ length: 1000 }, (_, i) => `Item ${i}`);
        }
        return this._data;
    }
    
    // 惰性计算属性
    get computedValue(): number {
        if (this._computedValue === null) {
            console.log("Computing expensive value...");
            // 模拟复杂的计算
            this._computedValue = this.data.length * Math.random();
        }
        return this._computedValue;
    }
    
    // 重置缓存
    public resetCache(): void {
        this._data = null;
        this._computedValue = null;
    }
    
    get dataCount(): number {
        return this.data.length; // 触发惰性初始化
    }
}

let obj = new ExpensiveObject();
console.log("Object created");

// 第一次访问触发初始化
console.log(obj.dataCount); // "Initializing expensive data..." 然后输出 1000

// 后续访问使用缓存
console.log(obj.computedValue); // "Computing expensive value..." 然后输出计算结果
console.log(obj.computedValue); // 直接返回缓存结果，无额外输出

obj.resetCache(); // 重置缓存
console.log(obj.dataCount); // 再次触发初始化
```