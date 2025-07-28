## baseUrl 配置

### baseUrl 基础配置
```typescript
// baseUrl 配置示例
{
  "compilerOptions": {
    "baseUrl": "./src",  // 设置基础目录为 src
    "target": "ES2020",
    "module": "commonjs"
  }
}

// 项目结构：
// project/
//   ├── src/
//   │   ├── components/
//   │   │   └── Button.ts
//   │   ├── models/
//   │   │   └── User.ts
//   │   ├── services/
//   │   │   └── ApiService.ts
//   │   └── index.ts
//   └── tsconfig.json

// 使用 baseUrl 的导入示例：
// src/index.ts
import { Button } from 'components/Button';  // 解析到 src/components/Button.ts
import { User } from 'models/User';          // 解析到 src/models/User.ts
import { ApiService } from 'services/ApiService';  // 解析到 src/services/ApiService.ts

// 不使用 baseUrl 的等效导入：
// import { Button } from './components/Button';
// import { User } from './models/User';
// import { ApiService } from './services/ApiService';
```

### baseUrl 与路径映射结合
```typescript
// baseUrl 与路径映射结合使用
{
  "compilerOptions": {
    "baseUrl": "./src",  // baseUrl 作为路径映射的基础
    "paths": {
      // 相对于 baseUrl 的路径
      "@/*": ["./*"],                    // @/component/Button -> src/component/Button
      "@components/*": ["./components/*"],  // @components/Button -> src/components/Button
      "@models/*": ["./models/*"],          // @models/User -> src/models/User
      "@services/*": ["./services/*"],      // @services/ApiService -> src/services/ApiService
      
      // 绝对路径映射（相对于项目根目录）
      "shared/*": ["../shared/src/*"],      // shared/module -> ../shared/src/module
      
      // 多候选项
      "utils/*": [
        "./utils/*",           // src/utils/*
        "../shared/utils/*"    // ../shared/utils/*
      ]
    }
  }
}

// 实际应用示例：
// src/services/UserService.ts
import { User } from '@models/User';        // baseUrl + paths 映射
import { Logger } from 'utils/Logger';      // baseUrl 直接解析
import { validateEmail } from 'utils/validators';  // baseUrl 直接解析

export class UserService {
    private users: User[] = [];
    
    constructor(private logger: Logger) {}
    
    addUser(userData: Omit<User, 'id'>): User {
        if (!validateEmail(userData.email)) {
            throw new Error('Invalid email');
        }
        
        const user: User = {
            ...userData,
            id: Math.random().toString(36)
        };
        
        this.users.push(user);
        this.logger.log(`Added user: ${user.name}`);
        return user;
    }
}
```

### baseUrl 的高级用法
```typescript
// 复杂的 baseUrl 配置
{
  "compilerOptions": {
    "baseUrl": ".",  // 项目根目录
    "paths": {
      // 项目内部模块
      "@app/*": ["src/app/*"],
      "@shared/*": ["src/shared/*"],
      "@ui/*": ["src/components/ui/*"],
      
      // 第三方库重定向
      "react": ["node_modules/preact/compat"],
      "react-dom": ["node_modules/preact/compat"],
      
      // 别名简化
      "@config": ["src/config/index"],
      "@logger": ["src/utils/Logger"],
      "@types": ["src/types/index"],
      
      // 多项目共享
      "common/*": ["../common/src/*"],
      "shared/*": ["../shared/src/*"]
    }
  }
}

// 项目结构：
// workspace/
//   ├── project-a/
//   │   ├── src/
//   │   │   ├── app/
//   │   │   ├── components/
//   │   │   └── utils/
//   │   └── tsconfig.json
//   ├── common/
//   │   └── src/
//   │       ├── types/
//   │       └── utils/
//   └── shared/
//       └── src/
//           ├── models/
//           └── services/

// 使用示例：
// src/app/main.ts
import { AppComponent } from '@app/AppComponent';  // project-a/src/app/AppComponent
import { User } from 'shared/models/User';         // ../shared/src/models/User
import { Logger } from '@logger';                  // project-a/src/utils/Logger
import { AppConfig } from '@config';               // project-a/src/config/index
import { CommonUtils } from 'common/utils';        // ../common/src/utils

// 类型定义共享
// src/types/index.ts
export interface ApiResponse<T> {
    success: boolean;
     T;
    message?: string;
}

export type UserRole = 'admin' | 'user' | 'guest';

// 使用共享类型
// src/app/UserManager.ts
import { ApiResponse, UserRole } from '@types';
import { User } from 'shared/models/User';

export class UserManager {
    async getUsers(): Promise<ApiResponse<User[]>> {
        // 实现获取用户逻辑
        return {
            success: true,
             []
        };
    }
    
    checkUserRole(role: UserRole): boolean {
        return role === 'admin' || role === 'user';
    }
}
```