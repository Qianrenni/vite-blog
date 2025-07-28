## 枚举类型（Enum Types）

### 数字枚举
```typescript
// 基本数字枚举
enum Direction {
    Up,    // 0
    Down,  // 1
    Left,  // 2
    Right  // 3
}

let dir: Direction = Direction.Up;
console.log(dir); // 0
console.log(Direction[0]); // "Up"

// 手动赋值
enum StatusCode {
    OK = 200,
    NotFound = 404,
    ServerError = 500
}

// 部分初始化
enum MixedEnum {
    First,      // 0
    Second,     // 1
    Third = 10, // 10
    Fourth      // 11
}
```

### 字符串枚举
```typescript
// 字符串枚举
enum DirectionStr {
    Up = "UP",
    Down = "DOWN",
    Left = "LEFT",
    Right = "RIGHT"
}

let strDir: DirectionStr = DirectionStr.Up;
console.log(strDir); // "UP"

// 字符串枚举的优势
// 1. 运行时有意义的值
// 2. 更好的调试体验
// 3. 序列化友好
```

### 异构枚举
```typescript
// 混合数字和字符串
enum BooleanLikeHeterogeneousEnum {
    No = 0,
    Yes = "YES"
}

// 注意：不推荐使用异构枚举
// 因为它们容易引起混淆
```

### 常量枚举
```typescript
// 常量枚举（编译时求值）
const enum DirectionConst {
    Up,
    Down,
    Left,
    Right
}

let directions = [
    DirectionConst.Up,
    DirectionConst.Down,
    DirectionConst.Left,
    DirectionConst.Right
];

// 编译后会被完全内联，不生成运行时代码
```

### 计算枚举
```typescript
// 使用表达式初始化
enum FileAccess {
    None = 0,
    Read = 1 << 1,    // 2
    Write = 1 << 2,   // 4
    ReadWrite = Read | Write, // 6
}

// 使用函数计算
function getEnumValue(): number {
    return Math.floor(Math.random() * 100);
}

enum ComputedEnum {
    First = 1,
    Second = getEnumValue(), // 运行时计算
    Third = 2
}
```

### 枚举成员类型
```typescript
// 字面量枚举成员
enum ShapeKind {
    Circle,    // 字面量枚举成员
    Square = 1, // 字面量枚举成员
    Rectangle = ShapeKind.Circle + 1 // 非字面量枚举成员
}

// 联合枚举
enum E { A, B }
let e: E = E.A;

// 反向映射
enum Enum {
    A
}
let a = Enum.A; // 0
let nameOfA = Enum[a]; // "A"
```