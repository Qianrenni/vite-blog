## 1. Source Maps 配置

Source Maps 是调试 TypeScript 代码的关键，它将编译后的 JavaScript 代码映射回原始的 TypeScript 源代码。

### 基本 Source Maps 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    // 启用 source map 生成
    "sourceMap": true,
    
    // 或者使用内联 source map
    "inlineSourceMap": false,
    
    // 包含源代码在 source map 中
    "inlineSources": true,
    
    // 指定 source map 文件的位置
    "mapRoot": "./sourcemaps",
    
    // 指定源文件根目录
    "sourceRoot": "./src"
  }
}
```

### 详细的 Source Maps 配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    
    // 基本 source map 配置
    "sourceMap": true,
    "inlineSources": true,
    
    // 调试优化配置
    "removeComments": false, // 保留注释有助于调试
    "declaration": true,     // 生成声明文件
    
    // 严格模式有助于调试时发现问题
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  },
  "include": [
    "src/**/*"
  ]
}
```

### Webpack 中的 Source Maps 配置

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  devtool: 'source-map', // 或 'inline-source-map', 'eval-source-map'
  
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  
  // 开发服务器配置
  devServer: {
    contentBase: './dist',
    hot: true
  }
};
```

### 不同环境的 Source Maps 策略

```javascript
// webpack.config.js
const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  // ... 其他配置
  
  devtool: isDevelopment ? 'eval-source-map' : 'source-map',
  
  optimization: {
    minimize: !isDevelopment
  }
};
```

### 自定义 Source Maps 路径

```json
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSources": true,
    "mapRoot": "https://myapp.com/sourcemaps/",
    "sourceRoot": "src/"
  }
}
```