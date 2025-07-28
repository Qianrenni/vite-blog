## 1. /// <reference path="..." />

这是最常见的三斜线指令，用于告诉编译器包含另一个文件。

### 基本用法

```typescript
// file1.ts
namespace MyNamespace {
    export interface User {
        name: string;
        age: number;
    }
    
    export function greet(user: User): string {
        return `Hello, ${user.name}!`;
    }
}

// file2.ts
/// <reference path="./file1.ts" />

// 现在可以使用 file1.ts 中的定义
const user: MyNamespace.User = {
    name: "Alice",
    age: 30
};

console.log(MyNamespace.greet(user));
```

### 编译示例

```bash
# 编译包含引用的文件
tsc file2.ts

# 或者编译到单个文件
tsc --outFile bundle.js file2.ts
```

### 实际应用示例

```typescript
// validation.ts
namespace Validation {
    export interface StringValidator {
        isAcceptable(s: string): boolean;
    }
}

// lettersOnlyValidator.ts
/// <reference path="./validation.ts" />

namespace Validation {
    const lettersRegexp = /^[A-Za-z]+$/;
    
    export class LettersOnlyValidator implements StringValidator {
        isAcceptable(s: string): boolean {
            return lettersRegexp.test(s);
        }
    }
}

// zipCodeValidator.ts
/// <reference path="./validation.ts" />

namespace Validation {
    const numberRegexp = /^[0-9]+$/;
    
    export class ZipCodeValidator implements StringValidator {
        isAcceptable(s: string): boolean {
            return s.length === 5 && numberRegexp.test(s);
        }
    }
}

// test.ts
/// <reference path="./validation.ts" />
/// <reference path="./lettersOnlyValidator.ts" />
/// <reference path="./zipCodeValidator.ts" />

let validators: { [s: string]: Validation.StringValidator; } = {};
validators["ZIP code"] = new Validation.ZipCodeValidator();
validators["Letters only"] = new Validation.LettersOnlyValidator();
```

### 路径解析规则

```typescript
// 相对路径
/// <reference path="./utils.ts" />
/// <reference path="../shared/types.ts" />
/// <reference path="./components/button.ts" />

// 绝对路径（相对于项目根目录）
/// <reference path="/src/core/interfaces.ts" />
```