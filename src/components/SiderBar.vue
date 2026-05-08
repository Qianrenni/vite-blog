<template>
  <div class="container sider-bar bg-card scroll-container">
    <QTree :data="trees" @node-click="handleNodeClick" />
  </div>
</template>
<script lang="ts" setup>
import type { TreeNodeData } from "qyani-components";
import { QTree } from "qyani-components";
import categories from "../../public/assets/categories.json";
import { onBeforeMount, ref, watch } from "vue";
import router from "@/router";
interface Section {
  id: string;
  title: string;
  children?: Section[];
}
const trees = ref<TreeNodeData[]>([]);
const transformSections = (
  sections: Section[],
  dir: string,
): TreeNodeData[] => {
  return sections.map((section) => ({
    id: `${dir}/content/${section.id}`,
    label: section.title,
    children: section.children
      ? transformSections(section.children, dir)
      : undefined,
  }));
};
const handleNodeClick = (node: TreeNodeData) => {
  if (
    (node.id as string).endsWith(".md") &&
    (node.children?.length ?? 0) === 0
  ) {
    router.replace({
      path: "/course",
      query: { file_path: node.id },
    });
  }
};
onBeforeMount(async () => {
  const cachedTrees = sessionStorage.getItem("trees");
  if (cachedTrees) {
    trees.value = JSON.parse(cachedTrees);
    return;
  }
  await Promise.all(
    categories.map(async (category, index) => {
      const newNode: TreeNodeData = {
        id: `category${index}`,
        label: category.name,
        children: [],
      };
      const sections: Section[][] = await Promise.all(
        category.courses.map((course) =>
          fetch(`/assets/md/${course.dir}/course.json`).then((res) =>
            res.json(),
          ),
        ),
      );
      const transformedSections = sections.map((section, index) =>
        transformSections(section, category.courses[index].dir),
      );
      category.courses.forEach((course, index) => {
        newNode.children!.push({
          id: `${course.dir}`,
          label: course.name,
          children: transformedSections[index],
        });
      });
      return newNode;
    }),
  ).then((newNodes) => {
    trees.value = newNodes;
    sessionStorage.setItem("trees", JSON.stringify(newNodes));
  });
});
watch(
  () => trees.value,
  (trees) => {
    sessionStorage.setItem("trees", JSON.stringify(trees));
  },
  {
    deep: true,
  },
);
</script>
<style scoped>
.sider-bar {
  max-width: 75vw;
  height: 100vh;
}
</style>
