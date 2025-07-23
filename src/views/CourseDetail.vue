<template>
  <div class="course-detail-container  ">
      <QCollapsibleSection  ref="siderbar" direction="up" class="sidebar-container " :is-show-arrow="sidebarArrowShow">
        <nav class="sidebar " style="max-width: 200px;">
        <QNavSection :sections="sections" @select="handleNavigation"  :title="`课程目录`"/>
        </nav>
      </QCollapsibleSection>
    <main ref="content" class="content-container ">
      <QMarkdownRender :content="markdownContent" />
    </main>
  </div>
</template>
<script setup lang="ts">
import {ref, onBeforeMount, onBeforeUnmount, watch,defineOptions} from 'vue'
import { useRoute } from 'vue-router'
import { QCollapsibleSection, QMarkdownRender, QNavSection } from "qyani-components"
defineOptions({
  name: 'CourseDetail'
})
const route = useRoute()
const sections = ref([])
const markdownContent = ref('')
const sidebarArrowShow = ref(window.innerWidth <= 768)
const content = ref<HTMLElement | null>(null)
const siderbar = ref<InstanceType<typeof QCollapsibleSection> | null>(null)

const loadCourseData = async (courseDir: string) => {
  try {
    const response = await fetch(`/assets/md/${courseDir}/course.json`);
    if(!response.ok){
      throw new Error('Network response was not ok')
    }
    sections.value = await response.json();
    const firstFile = getFirstLeaf(sections.value);
    if (firstFile) {
      await loadMarkdownContent(courseDir, firstFile.id)
    }
  } catch (err) {
    console.log(err);
    markdownContent.value = '<h2>找不到该课程的内容</h2>'
    sections.value = []
  }
}

const getFirstLeaf = (nodes: any[]): any | null => {
  for (const node of nodes) {
    if (!node.children || node.children.length === 0) {
      return node
    } else {
      const result = getFirstLeaf(node.children)
      if (result) return result
    }
  }
  return null
}
const cache:{ [key: string]: string } = {}
const loadMarkdownContent = async (courseDir: string, fileName: string) => {
  try {
    const response = await fetch(`/assets/md/${courseDir}/content/${fileName}`)
    if(!response.ok){
      throw new Error('Network response was not ok')
    }
    cache[fileName] = await response.text();
    markdownContent.value = cache[fileName];

  } catch (err) {
    console.log(err);
    markdownContent.value = `<h2>无法加载 ${fileName}</h2>`
  }
}

const handleNavigation = async (item: any) => {
  await loadMarkdownContent(route.params.courseDir as string, item.id)
  setTimeout(() => {
    content.value?.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, 50)
}


const handleResize = () => {
  if (window.innerWidth <= 768) {
    sidebarArrowShow.value = true
  } else {
    sidebarArrowShow.value = false
    siderbar.value?.open()
  }
}
watch(
    () => route.params,
    async (newVal, oldVal) => {
      if (newVal.courseDir !== oldVal.courseDir) {
        await loadCourseData(newVal.courseDir as string)
      }
    }
)
onBeforeMount(() => {
  window.addEventListener('resize', handleResize)
  if (route.params.courseDir) {
    loadCourseData(route.params.courseDir as string)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
<style scoped>

</style>