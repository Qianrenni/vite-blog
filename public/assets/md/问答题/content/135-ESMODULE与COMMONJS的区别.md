##  ESMODULE与COMMONJS的区别

| 维度 | ES Module (ESM) | CommonJS (CJS) |
|------|------------------|----------------|
| **语法** | `import A from 'B'`<br>`export default ...`<br>`export { x }` | `const A = require('B')`<br>`module.exports = ...`<br>`exports.x = ...` |
| **加载时机** | **静态加载**（编译时解析，依赖关系固定） | **动态加载**（运行时执行 `require()`） |
| **导出/导入本质** | **只读实时绑定**（live read-only binding） | **值拷贝**（导出时的快照，对对象仍是引用） |
| **能否修改导入值** | ❌ 不能重新赋值（只读）<br>✅ 可改对象属性 | ❌ 不能重新赋值（`A = x` 无效）<br>✅ 可改对象属性 |
| **循环依赖处理** | ✅ 支持（因绑定是“活”的） | ⚠️ 可能拿到未初始化的 `undefined` 或部分值 |
| **顶层作用域** | 模块顶层是**模块作用域**（非全局） | 模块顶层是**函数作用域**（Node.js 包裹在函数中） |
| **`this` 指向** | `undefined`（严格模式） | 指向 `module.exports` |
| **文件扩展名** | 通常需显式 `.js`（或配置支持） | 可省略（自动补 `.js`, `.json`, `.node`） |
| **Node.js 支持** | `.mjs` 或 `package.json` 中设 `"type": "module"` | 默认（`.cjs` 或普通 `.js` 在 `"type": "commonjs"` 下） |
| **Tree Shaking** | ✅ 原生支持（静态结构） | ❌ 不支持（动态性阻碍静态分析） |
| **浏览器支持** | ✅ 原生支持（`<script type="module">`） | ❌ 不支持（需打包工具转换） |

---
- **ESM 是“声明式 + 静态 + 只读绑定”** → 适合现代工具链和浏览器。
- **CJS 是“命令式 + 动态 + 值拷贝”** → 适合 Node.js 脚本和动态逻辑。