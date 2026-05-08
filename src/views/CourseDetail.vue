<template>
  <div class="container-column">
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
import { QMarkdownRender } from "qyani-components";
defineOptions({
  name: "CourseDetail",
});
const route = useRoute();
const markdownContent = ref("");
const cache: { [key: string]: string } = {};
const loadMarkdownContent = async (filePath: string) => {
  try {
    const response = await fetch(`/assets/md/${filePath}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    cache[filePath] = await response.text();
    markdownContent.value = cache[filePath];
  } catch (err) {
    console.log(err);
    markdownContent.value = `<h2>无法加载 ${filePath}</h2>`;
  }
};
onBeforeMount(() => {
  loadMarkdownContent(route.query.file_path as string);
});
watch(
  () => route.query.file_path,
  (filePath) => {
    loadMarkdownContent(filePath as string);
  },
);
</script>
<style scoped></style>
