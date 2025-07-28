## tsconfig.json 结构

### 基本结构
```json
{
  "compilerOptions": {
    // 编译器选项
  },
  "files": [
    // 指定要编译的文件列表
  ],
  "include": [
    // 包含的文件模式
  ],
  "exclude": [
    // 排除的文件模式
  ],
  "references": [
    // 项目引用
  ],
  "compileOnSave": true,
  "extends": "./base-tsconfig.json",
  "watchOptions": {
    // 监视选项
  }
}
```

### 完整的 tsconfig.json 示例
```json
{
  "compilerOptions": {
    // 基础选项
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    
    // 严格类型检查
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    // 模块解析
    "moduleResolution": "node",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    },
    
    // 装饰器支持
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    
    // 其他选项
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "sourceMap": true,
    "declaration": true,
    "removeComments": true
  },
  
  "include": [
    "src/**/*"
  ],
  
  "exclude": [
    "node_modules",
    "dist",
    "**/*.spec.ts"
  ],
  
  "references": [
    { "path": "../shared" }
  ],
  
  "compileOnSave": true
}
```

### files、include 和 exclude 配置
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "outDir": "./dist"
  },
  
  // 方式一：明确指定文件
  "files": [
    "src/index.ts",
    "src/utils.ts",
    "src/models/user.ts"
  ],
  
  // 方式二：包含文件模式（更常用）
  "include": [
    "src/**/*",           // src 目录下所有文件
    "tests/**/*.ts",      // tests 目录下所有 .ts 文件
    "typings/**/*.d.ts"   // 类型定义文件
  ],
  
  // 排除文件模式
  "exclude": [
    "node_modules",       // 排除 node_modules
    "dist",              // 排除输出目录
    "**/*.spec.ts",      // 排除测试文件
    "src/test-files"     // 排除特定目录
  ],
  
  // 通配符说明
  // * 匹配零个或多个字符（不包括目录分隔符）
  // ? 匹配一个字符
  // ** 递归匹配任意层级目录
}
```