### 3. **父 ↔ 子：v-model（双向绑定）**
Vue 3 支持多个 `v-model`，通过 `modelValue` 和 `update:modelValue` 实现。

**父组件：**
```vue
<template>
  <ChildComponent v-model="inputValue" />
</template>

<script setup>
import { ref } from 'vue'
const inputValue = ref('initial')
</script>
```

**子组件：**
```vue
<template>
  <input :value="modelValue" @input="updateValue" />
</template>

<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

function updateValue(event) {
  emit('update:modelValue', event.target.value)
}
</script>
```

> 也可以使用 `defineModel()`（Vue 3.4+ 实验性宏）简化写法。

---