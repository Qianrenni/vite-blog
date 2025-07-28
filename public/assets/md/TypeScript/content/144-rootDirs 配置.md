## rootDirs 配置

### rootDirs 基础概念
```typescript
// rootDirs 配置允许将多个目录视为一个虚拟目录结构
{
  "compilerOptions": {
    "rootDirs": [
      "src/views",
      "generated/templates"
    ],
    "outDir": "dist"
  }
}

// 项目结构：
// project/
//   ├── src/
//   │   └── views/
//   │       └── user-view.ts
//   ├── generated/
//   │   └── templates/
//   │       └── user-template.ts
//   └── tsconfig.json

// rootDirs 的作用：
// 1. 允许模块在不同的目录中"合并"
// 2. 编译时将这些目录视为一个虚拟目录
// 3. 便于代码生成和模板系统

// src/views/user-view.ts
import { UserTemplate } from './user-template';  // 可以导入 generated/templates 中的文件

// generated/templates/user-template.ts
export class UserTemplate {
    render(user: any): string {
        return `<div>${user.name}</div>`;
    }
}
```

### rootDirs 实际应用
```typescript
// 实际的 rootDirs 配置示例
{
  "compilerOptions": {
    "rootDirs": [
      "src",
      "generated",
      "shared"
    ],
    "outDir": "dist",
    "baseUrl": ".",
    "paths": {
      "@generated/*": ["generated/*"],
      "@shared/*": ["shared/*"]
    }
  }
}

// 项目结构：
// project/
//   ├── src/
//   │   ├── components/
//   │   │   └── UserComponent.ts
//   │   └── services/
//   │       └── UserService.ts
//   ├── generated/
//   │   ├── models/
//   │   │   └── GeneratedModels.ts
//   │   └── api/
//   │       └── GeneratedApi.ts
//   ├── shared/
//   │   ├── types/
//   │   │   └── SharedTypes.ts
//   │   └── utils/
//   │       └── SharedUtils.ts
//   └── tsconfig.json

// src/components/UserComponent.ts
import { UserService } from 'services/UserService';           // 来自 src
import { GeneratedUser } from 'models/GeneratedModels';       // 来自 generated
import { SharedType } from 'types/SharedTypes';               // 来自 shared
import { apiCall } from 'api/GeneratedApi';                   // 来自 generated

export class UserComponent {
    constructor(private userService: UserService) {}
    
    async renderUser(userId: string): Promise<string> {
        const user = await this.userService.getUser(userId);
        const generatedUser: GeneratedUser = {
            id: user.id,
            name: user.name,
            email: user.email
        };
        
        return apiCall('renderUser', generatedUser);
    }
}
```

### rootDirs 与代码生成
```typescript
// 代码生成场景的 rootDirs 配置
{
  "compilerOptions": {
    "rootDirs": [
      "src",
      "generated/client",
      "generated/server"
    ],
    "outDir": "dist",
    "declaration": true,
    "declarationDir": "types"
  }
}

// 项目结构：
// project/
//   ├── src/
//   │   ├── client/
//   │   │   └── App.ts
//   │   └── server/
//   │       └── Server.ts
//   ├── generated/
//   │   ├── client/
//   │   │   ├── api-client.ts
//   │   │   └── models.ts
//   │   └── server/
//   │       ├── database.ts
//   │       └── routes.ts
//   └── tsconfig.json

// 代码生成示例：
// 生成的客户端 API
// generated/client/api-client.ts
export interface User {
    id: string;
    name: string;
    email: string;
}

export async function fetchUser(id: string): Promise<User> {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
}

// 生成的服务端路由
// generated/server/routes.ts
import { Request, Response } from 'express';

export function getUserRoute(req: Request, res: Response) {
    // 处理获取用户请求
    res.json({ id: '1', name: 'John', email: 'john@example.com' });
}

// src/client/App.ts
import { fetchUser } from 'api-client';  // 从 generated/client 导入
import { User } from 'models';           // 从 generated/client 导入

export class App {
    async loadUser(userId: string) {
        try {
            const user: User = await fetchUser(userId);
            console.log('Loaded user:', user);
        } catch (error) {
            console.error('Failed to load user:', error);
        }
    }
}

// src/server/Server.ts
import express from 'express';
import { getUserRoute } from 'routes';  // 从 generated/server 导入

export class Server {
    private app = express();
    
    constructor() {
        this.setupRoutes();
    }
    
    private setupRoutes() {
        this.app.get('/api/users/:id', getUserRoute);
    }
    
    start(port: number) {
        this.app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    }
}
```

### rootDirs 与构建系统集成
```typescript
// 复杂的构建系统配置
{
  "compilerOptions": {
    "rootDirs": [
      "src",
      "generated/types",
      "generated/api",
      "shared"
    ],
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/app/*"],
      "@generated/*": ["generated/*"],
      "@shared/*": ["shared/*"],
      "@types": ["generated/types/index"]
    },
    "outDir": "dist",
    "declaration": true,
    "composite": true
  },
  "references": [
    { "path": "./tsconfig.shared.json" }
  ]
}

// 构建脚本示例：
// package.json
{
  "scripts": {
    "prebuild": "npm run generate",
    "generate": "node scripts/generate-code.js",
    "build": "tsc --build",
    "watch": "tsc --build --watch",
    "clean": "tsc --build --clean"
  }
}

// 代码生成脚本示例：
// scripts/generate-code.js
const fs = require('fs');
const path = require('path');

// 生成 API 客户端
function generateApiClient() {
    const apiContent = `
export interface User {
    id: string;
    name: string;
    email: string;
}

export async function fetchUser(id: string): Promise<User> {
    // 实现 API 调用
    return { id, name: 'Generated User', email: 'generated@example.com' };
}
    `;
    
    fs.writeFileSync(
        path.join(__dirname, '../generated/api/client.ts'),
        apiContent.trim()
    );
}

// 生成类型定义
function generateTypes() {
    const typesContent = `
export type Status = 'pending' | 'approved' | 'rejected';
export type Priority = 'low' | 'medium' | 'high';

export interface ApiResponse<T> {
    success: boolean;
     T;
    message?: string;
}
    `;
    
    fs.writeFileSync(
        path.join(__dirname, '../generated/types/index.ts'),
        typesContent.trim()
    );
}

// 执行生成
generateApiClient();
generateTypes();
console.log('Code generation completed');

// 使用生成的代码：
// src/app/UserManager.ts
import { fetchUser } from '@generated/api/client';  // 生成的 API 客户端
import { Status, ApiResponse } from '@types';       // 生成的类型

export class UserManager {
    async loadUser(id: string): Promise<ApiResponse<User>> {
        try {
            const user = await fetchUser(id);
            return {
                success: true,
                 user
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
    
    checkStatus(status: Status): boolean {
        return status === 'approved';
    }
}
```