### 四、框架与工具链优化（以 React/Vue 为例）

#### React

- 使用 `React.memo` / `useMemo` / `useCallback` 避免重复渲染
- 避免在 render 中创建新对象/函数
- 使用 Suspense + lazy 实现组件懒加载
- 使用 Profiler 分析组件性能

#### Vue

- 使用 `v-once` / `v-memo`（Vue 3.2+）减少重复渲染
- 合理使用 `computed` / `watch`，避免过度监听
- 组件懒加载：`() => import('./Component.vue')`
- 使用 `<KeepAlive>` 缓存组件状态

#### 工具链

- Webpack：代码分割、Tree Shaking、压缩、持久化缓存
- Vite：ESM 原生加载，开发时更快
- 使用现代构建目标（ES2015+，减少 polyfill 体积）
- 分析打包体积（webpack-bundle-analyzer）

---