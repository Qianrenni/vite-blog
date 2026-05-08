<template>
  <div class="container-column">
    <QCollapsibleSection :initial-expanded="false">
      <QNavSection
        class="container-w100"
        :sections="sections"
        :title="'课程目录'"
        @select="(v) => loadMarkdownContent(route.query.dir as string, v.id)"
      />
    </QCollapsibleSection>
    <QMarkdownRender
      :content="markdownContent"
      :show-copy="false"
      class="scroll-container"
      style="height: calc(100vh - 5rem)"
    >
    </QMarkdownRender>
  </div>
</template>
<script setup lang="ts">
import { ref, onBeforeMount, watch } from "vue";
import { useRoute } from "vue-router";
import {
  QCollapsibleSection,
  QMarkdownRender,
  QNavSection,
  type TreeNodeData,
} from "qyani-components";
defineOptions({
  name: "CourseDetail",
});
interface Section {
  id: string;
  title: string;
  children?: Section[];
}
const route = useRoute();
const sections = ref<Section[]>([]);
const treeBook = ref<TreeNodeData[]>([]);
const markdownContent = ref("");
const transformSections = (sections: Section[]): TreeNodeData[] => {
  return sections.map((section) => ({
    label: section.title,
    id: section.id,
    children: section.children
      ? transformSections(section.children)
      : undefined,
  }));
};
const loadCourseData = async (courseDir: string) => {
  try {
    const response = await fetch(`/assets/md/${courseDir}/course.json`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    sections.value = await response.json();
    const firstFile = getFirstLeaf(sections.value);
    if (firstFile) {
      await loadMarkdownContent(courseDir, firstFile.id);
    }
    treeBook.value = transformSections(sections.value);
    console.log(treeBook.value);
  } catch (err) {
    console.log(err);
    markdownContent.value = "<h2>找不到该课程的内容</h2>";
    sections.value = [];
  }
};

const getFirstLeaf = (nodes: any[]): any | null => {
  for (const node of nodes) {
    if (!node.children || node.children.length === 0) {
      return node;
    } else {
      const result = getFirstLeaf(node.children);
      if (result) return result;
    }
  }
  return null;
};
const cache: { [key: string]: string } = {};
const loadMarkdownContent = async (courseDir: string, fileName: string) => {
  try {
    const response = await fetch(`/assets/md/${courseDir}/content/${fileName}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    cache[fileName] = await response.text();
    markdownContent.value = cache[fileName];
  } catch (err) {
    console.log(err);
    markdownContent.value = `<h2>无法加载 ${fileName}</h2>`;
  }
};

onBeforeMount(() => {
  const dir = route.query.dir as string;
  loadCourseData(dir);
});
watch(
  () => route.query.dir,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      loadCourseData(newVal as string);
    }
  },
);
</script>
<style scoped></style>
