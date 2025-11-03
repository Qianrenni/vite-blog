### 4. **父组件访问子组件实例：`ref` + `defineExpose`**
父组件通过 `ref` 获取子组件实例，调用其方法或访问暴露的数据。

**子组件：**
```vue
<script setup>
import { ref } from 'vue'

const childData = ref('secret')
const doSomething = () => {
  console.log('Child method called')
}

// 暴露给父组件
defineExpose({
  childData,
  doSomething
})
</script>
```

**父组件：**
```vue
<template>
  <ChildComponent ref="childRef" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ChildComponent from './ChildComponent.vue'

const childRef = ref()

onMounted(() => {
  childRef.value.doSomething()
  console.log(childRef.value.childData.value)
})
</script>
```

---