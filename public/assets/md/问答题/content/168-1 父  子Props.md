### 1. **父 → 子：Props**
这是最常见、最推荐的单向数据流方式。

**父组件：**
```vue
<template>
  <ChildComponent :message="parentMsg" />
</template>

<script setup>
import ChildComponent from './ChildComponent.vue'
const parentMsg = 'Hello from parent'
</script>
```

**子组件：**
```vue
<template>
  <p>{{ message }}</p>
</template>

<script setup>
defineProps({
  message: String
})
</script>
```

---