### 5. **跨层级或复杂场景：依赖注入（`provide` / `inject`）**
适用于祖先组件向深层后代传递数据，避免逐层 props 透传。

**祖先组件：**
```js
import { provide, ref } from 'vue'
const theme = ref('dark')
provide('theme', theme)
```

**后代组件：**
```js
import { inject } from 'vue'
const theme = inject('theme')
```

> 注意：`provide/inject` 不适用于兄弟组件通信。

---