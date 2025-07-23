<template>
  <header
      class="
          text-secondary
          border-bottom-foreground
            "
      ref="header"
      style="
        position: sticky;
        top: 0;
        z-index: 1000;
            "
  >
    <header class="
                container-space-between
                container-align-center
                padding-third-rem
                  "
    >

      <!-- Logo -->
      <div class="logo">
        <img src="../../public/assets/logo.png" alt="Logo" />
        <span>QYANI</span>
      </div>
      <!-- 导航菜单（PC显示） -->
      <div class="container-space-between container-align-center gap">
        <nav
            class="desktop-nav container gap-half"
        >
          <router-link  to="/">首页</router-link>
          <router-link  to="/chat-ai">AI问答</router-link>
          <router-link  to="/courses">课程笔记</router-link>
          <router-link  to="/acticle">技术文章</router-link>
<!--          <router-link to="/projects">项目实验</router-link>-->
          <a href="http://1.95.141.194/user/" target="_blank">项目实验</a>
          <router-link to="/about">关于我</router-link>
        </nav>
        <div class="container-align-center">
          <QThemeToggle/>
          <button class="hamburger" @click="toggleMenu">
            ☰
          </button>
        </div>
      </div>
    </header>
    <!-- 响应式下拉菜单 -->
    <QCollapsibleSection ref="mobile-menu" :is-show-arrow="false" :initial-expanded="false">
      <nav class="mobile-menu" >
        <router-link to="/">首页</router-link>
        <router-link to="/chat-ai">AI问答</router-link>
        <router-link to="/courses">课程笔记</router-link>
        <router-link to="/acticle">技术文章</router-link>
<!--        <router-link to="/projects">项目实验</router-link>-->
        <a href="http://1.95.141.194/user/" target="_blank">项目实验</a>
        <router-link to="/about">关于我</router-link>
      </nav>
    </QCollapsibleSection>
  </header>
</template>

<script lang="ts" setup>

import { useTemplateRef} from 'vue'
import {QCollapsibleSection, QThemeToggle} from "qyani-components";
const header = useTemplateRef<HTMLElement>('header')
const mobileMenu = useTemplateRef<QCollapsibleSection>('mobile-menu')
const toggleMenu = () => {
  mobileMenu.value?.toggle()
};




</script>

<style scoped>

/* 主容器 */

/* Logo 样式 */
.logo {
  display: flex;
  align-items: center;
  font-size: 1.4rem;
  font-weight: bold;
}

.logo img {
  height: 32px;
  margin-right: 10px;
}

/* PC导航样式 */
.desktop-nav {}

.desktop-nav a {
  text-decoration: none;
  font-weight: 500;
}

/* 汉堡按钮 */
.hamburger{
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

/* 移动端菜单 */
.mobile-menu {
  /*background-color: #1e293b;*/
  transition: All 3s ease;
  display: none;
  flex-direction: column;
  padding: 1rem;
  text-align: center;
}
.mobile-menu a {
  text-decoration: none;
  margin: 0.5rem 0;
  font-size: 1.1rem;
}
/* 响应式断点 */
@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }
  .hamburger {
    display: block;
  }
  .mobile-menu {
    width: 100%;
    display: flex;
    justify-content: center;
  }
}
</style>