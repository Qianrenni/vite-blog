<template>
  <div class="article-container border-primary">
    <!-- 左侧文章列表 -->
    <QCollapsibleSection ref="siderbar" direction="up" class="sidebar-container " :is-show-arrow="sidebarArrowShow">
      <div class="article-list sidebar">
        <h2>文章列表</h2>
        <ul>
          <li
              v-for="(article,index) in articles"
              :key="index"
              :class="{ active: selectedIndex>=0 && selectedIndex===index}"
              class="hover-primary"
              @click="selectArticle(index)"
          >
            {{ article.title }}
          </li>
        </ul>
        <div v-if="articles.length === 0" class="empty-tip">暂无文章</div>
      </div>
    </QCollapsibleSection>

    <!-- 右侧文章内容 -->
    <div class="content-container">
      <div v-if="selectedIndex!==-1" style="display: flex;flex-direction: column;height: 100%">
        <QMarkdownRender style="flex: 1" :content="content" />
        <div class="article-meta text-muted">发布于: {{ articles[selectedIndex].date }}</div>
      </div>
      <div v-else class="empty-tip text-muted">
        请选择一篇文章查看详情
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import articles from "../../public/assets/articles/articles.json"
import {QCollapsibleSection, QMarkdownRender} from "qyani-components";
import {ref, onBeforeMount, onBeforeUnmount, useTemplateRef} from 'vue'

defineOptions({
  name: 'ArticlePage'
})
const selectedIndex = ref(-1)
const sidebarArrowShow = ref(window.innerWidth <= 768)
const siderbar = useTemplateRef<QCollapsibleSection>('siderbar')
const cache:Record<number, string> = {}
const content = ref('')
const selectArticle = async (index: number) => {
  try {
    if (cache[index] === undefined) {
      const response = await fetch(`/assets/articles/${articles[index].dirName}/article.md`)
      if (!response.ok){
        throw new Error('Network response was not ok')
      }
      cache[index] = await response.text()
      content.value = cache[index]
    }
  } catch(err) {
    console.log(err)
    content.value = `<h2>无法加载 ${articles[index].dirName}/article.md</h2>`
  }
  console.log(`select ${index}`)
  selectedIndex.value = index
}

const handleResize = () => {
  if (window.innerWidth <= 768) {
    sidebarArrowShow.value = true
  } else {
    sidebarArrowShow.value = false
    siderbar.value?.open()
  }
}

onBeforeMount(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.article-container {
  display: flex;
  height: var(--content-height-without-header);
}

.article-list {
  max-width: 350px;
  padding: 20px;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.article-list ul {
  list-style-type: none;
  padding: 0;
}

.article-list li {
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 8px;
}



.article-list li.active {
  background-color: var(--primary-color);
  color: white;
}

.empty-tip {
  text-align: center;
  padding: 30px 0;
}

.article-meta {
  font-size: 14px;
  text-align: center;
}
@media screen and (max-width: 768px) {
  .article-container{
    flex-direction: column-reverse;
  }
  .article-list{
    max-width: 100%;
    border-right: none;
  }
}
</style>