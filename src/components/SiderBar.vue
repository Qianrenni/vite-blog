<template>
  <div class="container sider-bar bg-card">
    <QTree :data="trees" @node-click="(node) => handleNodeClick(node)" />
  </div>
</template>
<script lang="ts" setup>
import type { TreeNodeData } from "qyani-components";
import { QTree } from "qyani-components";
import categories from "../../public/assets/categories.json";
import { onBeforeMount, ref } from "vue";
import router from "@/router";
const trees = ref<TreeNodeData[]>([]);
const p = new Map<number, { name: string; dir: string }>();
const handleNodeClick = (node: TreeNodeData) => {
  if (p.has(node.id as number)) {
    const course = p.get(node.id as number)!;
    router.replace({
      path: "/course",
      query: {
        dir: course.dir,
        name: course.name,
      },
    });
  }
};
onBeforeMount(() => {
  const temp: TreeNodeData[] = [];
  let current: TreeNodeData | undefined;
  let id = 0;
  categories.forEach((category) => {
    const node = temp.find((n) => n.label === category.name);
    if (!node) {
      const newNode: TreeNodeData = {
        id: id++,
        label: category.name,
        children: [],
      };
      temp.push(newNode);
      current = newNode;
    } else {
      current = node;
    }
    category.courses.forEach((course) => {
      current?.children?.push({ id: id, label: course.name });
      p.set(id, { name: course.name, dir: course.dir });
      id++;
    });
  });
  trees.value = temp;
});
</script>
<style scoped>
.sider-bar {
  max-width: 250px;
}
</style>
