## this 类型

### 显式 this 参数
```typescript
// 显式指定 this 类型
interface UIElement {
    addClickListener(onclick: (this: void, e: Event) => void): void;
}

class Handler {
    info: string;
    
    onClickBad(this: Handler, e: Event) {
        // 这里 this 的类型是 Handler
        this.info = e.type;
    }
    
    onClickGood(this: void, e: Event) {
        // 这里不能使用 this.info
        console.log('clicked!');
    }
}

let h = new Handler();
let uiElement: UIElement = {
    addClickListener(onclick) {
        // ...
    }
};

// uiElement.addClickListener(h.onClickBad); // 错误！
uiElement.addClickListener(h.onClickGood); // 正确
```

### 类中的 this 类型
```typescript
class MyClass {
    name: string = "MyClass";
    
    // 普通方法
    getName(): string {
        return this.name;
    }
    
    // 箭头函数属性
    getNameArrow = (): string => {
        return this.name;
    }
    
    // 返回 this 类型的方法（用于链式调用）
    setName(name: string): this {
        this.name = name;
        return this;
    }
    
    doSomething(): this {
        console.log("Doing something...");
        return this;
    }
}

// 链式调用
let instance = new MyClass();
instance.setName("New Name").doSomething();
```

### this 类型推断
```typescript
// 在类方法中，this 的类型会被自动推断
class Calculator {
    private result: number = 0;
    
    add(num: number): this {
        this.result += num;
        return this;
    }
    
    multiply(num: number): this {
        this.result *= num;
        return this;
    }
    
    getResult(): number {
        return this.result;
    }
}

let calc = new Calculator();
let finalResult = calc.add(5).multiply(2).getResult(); // 10
```

### this 在回调函数中的使用
```typescript
class Container {
    private items: string[] = [];
    
    addItem(item: string): void {
        this.items.push(item);
    }
    
    // 使用箭头函数保持 this 绑定
    processItems(callback: (item: string) => void): void {
        this.items.forEach(item => {
            callback(item); // this 绑定正确
        });
    }
    
    // 或者显式绑定 this
    processItems2(callback: (this: void, item: string) => void): void {
        this.items.forEach(item => {
            callback(item);
        });
    }
}
```

### 多态 this 类型
```typescript
// 多态 this 类型用于链式调用
class BasicCalculator {
    public constructor(protected value: number = 0) {}
    
    public currentValue(): number {
        return this.value;
    }
    
    public add(operand: number): this {
        this.value += operand;
        return this;
    }
    
    public multiply(operand: number): this {
        this.value *= operand;
        return this;
    }
}

class ScientificCalculator extends BasicCalculator {
    public constructor(value = 0) {
        super(value);
    }
    
    public sin(): this {
        this.value = Math.sin(this.value);
        return this;
    }
}

// 多态 this 允许链式调用继承的方法
let calc = new ScientificCalculator(10)
    .add(5)        // 返回 ScientificCalculator
    .multiply(2)   // 返回 ScientificCalculator
    .sin()         // 返回 ScientificCalculator
    .currentValue(); // 返回 number
```