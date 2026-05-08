<template>
  <router-view />
</template>
<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useRouter } from "vue-router";
defineOptions({
  name: "CourseNav",
});
const router = useRouter();
const clickCourse = (course: { name: string; dir: string }) => {
  router.push({
    path: `/courses/${course.name}/${course.dir}`,
  });
};
</script>
