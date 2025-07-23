<template>
  <QCollapsibleSection ref="courseNav" style="position: sticky;top:2.5rem;">
    <div class="course-nav-container text-secondary">
      <div class="course-nav" ref="navScroll">
        <div v-for="(category, index) in categories" :key="index" class="category-row">
          <!-- 左侧分类标题 -->
          <div class="category-header">
            <span class="icon">{{ category.icon }}</span>
            <span class="title">{{ category.name }}</span>
          </div>
          <!-- 右侧子课程列表 -->
          <div class="sub-courses">
            <QTag v-for="(course ,index) in category.courses" :key="index" :text="course.name" @click="clickCourse(course)"></QTag>
          </div>
        </div>
      </div>
    </div>
  </QCollapsibleSection>
  <router-view/>
</template>
<script setup lang="ts">

import {useTemplateRef} from 'vue';
import { useRouter } from 'vue-router';
import categories from '../../public/assets/categories.json';
import { QCollapsibleSection, QTag} from "qyani-components";
defineOptions({
  name: 'CourseNav',
})
const router = useRouter();
const courseNav =useTemplateRef<QCollapsibleSection>('courseNav')

const clickCourse = (course: { name: string, dir: string }) => {
  console.log(course);
  courseNav.value.toggle();
  router.push({
    path: `/courses/${course.name}/${course.dir}`,
  });
};
</script>

<style scoped>
.course-nav-container {
  width: 100%;

  padding: 1rem 0;
  border-bottom: 1px solid #e0e0e0;

}

.course-nav {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 1rem;
}

.category-row {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.category-header {
  width: 200px;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.icon {
  font-size: 1.2rem;
  margin-right: 0.5rem;
}

.title {
  font-size: 1rem;
}

.sub-courses {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: thin; /* Firefox */
  -webkit-overflow-scrolling: touch; /* iOS 滚动更顺滑 */
}

@media (max-width: 768px) {
  .category-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .category-header {
    margin-bottom: 0.5rem;
  }

  .sub-courses {
    width: 100%;
    flex-wrap: nowrap;
    overflow-x: auto;
    flex: 1;
    /* 隐藏滚动条（各浏览器兼容） */
    scrollbar-width: none;        /* Firefox */
    -ms-overflow-style: none;     /* IE 10+ */
  }
}
</style>