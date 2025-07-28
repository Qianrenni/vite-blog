## 访问修饰符（public, private, protected）

### public 修饰符
```typescript
// public 修饰符（默认）
class PublicExample {
    public name: string;        // 明确声明为 public
    age: number;                // 默认为 public
    
    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }
    
    public greet(): string {    // 明确声明为 public
        return `Hello, I'm ${this.name}`;
    }
    
    introduce(): string {       // 默认为 public
        return `I'm ${this.age} years old`;
    }
}

let publicObj = new PublicExample("Alice", 30);
console.log(publicObj.name);    // "Alice" - 可以访问
console.log(publicObj.age);     // 30 - 可以访问
console.log(publicObj.greet()); // "Hello, I'm Alice" - 可以调用
console.log(publicObj.introduce()); // "I'm 30 years old" - 可以调用
```

### private 修饰符
```typescript
// private 修饰符
class PrivateExample {
    private secret: string;
    private password: string;
    
    constructor(secret: string, password: string) {
        this.secret = secret;
        this.password = password;
    }
    
    private validatePassword(input: string): boolean {
        return input === this.password;
    }
    
    public revealSecret(inputPassword: string): string | null {
        if (this.validatePassword(inputPassword)) {
            return this.secret;
        }
        return null;
    }
    
    // private 构造函数（用于单例模式）
    private constructor(secret: string) {
        this.secret = secret;
    }
    
    private static instance: PrivateExample;
    
    public static getInstance(secret: string): PrivateExample {
        if (!PrivateExample.instance) {
            PrivateExample.instance = new PrivateExample(secret);
        }
        return PrivateExample.instance;
    }
}

let privateObj = new PrivateExample("Top Secret", "123456");
// privateObj.secret; // 错误！private 属性不能在类外部访问
// privateObj.validatePassword("123"); // 错误！private 方法不能在类外部调用

let secret = privateObj.revealSecret("123456"); // 通过 public 方法访问
console.log(secret); // "Top Secret"

// 单例模式示例
let instance1 = PrivateExample.getInstance("Secret1");
let instance2 = PrivateExample.getInstance("Secret2");
console.log(instance1 === instance2); // true - 同一个实例
```

### protected 修饰符
```typescript
// protected 修饰符
class ProtectedExample {
    protected name: string;
    protected internalId: string;
    
    constructor(name: string) {
        this.name = name;
        this.internalId = Math.random().toString(36);
    }
    
    protected generateReport(): string {
        return `Report for ${this.name} (${this.internalId})`;
    }
    
    public getPublicInfo(): string {
        return this.name; // 可以访问 protected 属性
    }
}

class ExtendedExample extends ProtectedExample {
    private department: string;
    
    constructor(name: string, department: string) {
        super(name);
        this.department = department;
    }
    
    public getFullInfo(): string {
        // 可以访问父类的 protected 属性和方法
        return `${this.name} - ${this.department} - ${this.generateReport()}`;
    }
    
    public tryAccess(): void {
        console.log(this.name);        // 可以访问
        console.log(this.internalId);  // 可以访问
        console.log(this.generateReport()); // 可以调用
    }
}

let protectedObj = new ProtectedExample("Base");
// protectedObj.name; // 错误！protected 属性不能在类外部访问

let extendedObj = new ExtendedExample("Extended", "IT");
console.log(extendedObj.getPublicInfo()); // "Extended" - 可以访问
console.log(extendedObj.getFullInfo());   // 可以访问 protected 成员
extendedObj.tryAccess(); // 可以访问所有 protected 成员
```

### 访问修饰符的实际应用
```typescript
// 实际应用示例：银行账户系统
class BankAccount {
    protected accountNumber: string;
    private balance: number;
    private pin: string;
    
    constructor(accountNumber: string, initialBalance: number, pin: string) {
        this.accountNumber = accountNumber;
        this.balance = initialBalance;
        this.pin = pin;
    }
    
    protected validatePin(inputPin: string): boolean {
        return inputPin === this.pin;
    }
    
    public getAccountNumber(): string {
        return this.accountNumber; // protected 属性可以被 public 方法访问
    }
    
    public getBalance(pin: string): number | null {
        if (this.validatePin(pin)) {
            return this.balance;
        }
        return null;
    }
    
    protected updateBalance(amount: number): void {
        this.balance += amount;
    }
}

class SavingsAccount extends BankAccount {
    private interestRate: number;
    
    constructor(
        accountNumber: string, 
        initialBalance: number, 
        pin: string, 
        interestRate: number
    ) {
        super(accountNumber, initialBalance, pin);
        this.interestRate = interestRate;
    }
    
    public addInterest(): void {
        // 可以访问父类的 protected 方法
        const interest = this.getBalance("dummy")! * this.interestRate;
        this.updateBalance(interest); // 访问 protected 方法
    }
    
    public deposit(pin: string, amount: number): boolean {
        if (this.validatePin(pin)) { // 访问 protected 方法
            this.updateBalance(amount); // 访问 protected 方法
            return true;
        }
        return false;
    }
}

let account = new SavingsAccount("123456789", 1000, "1234", 0.05);
console.log(account.getAccountNumber()); // "123456789"
console.log(account.getBalance("1234")); // 1000
// account.balance; // 错误！private 属性
// account.pin; // 错误！private 属性
```