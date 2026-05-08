<template>
  <header class="container-space-between container bg-card">
    <!-- Logo -->
    <div class="inner-container">
      <img src="/public/assets/logo.png" alt="Logo" :width="24" :height="24" />
      <span>QYANI</span>
    </div>
    <!-- 导航菜单（PC显示） -->
    <div class="inner-container">
      <nav>
        <router-link to="/" class="link-primary">课程笔记</router-link>
      </nav>
      <nav>
        <router-link to="/article" class="link-primary">技术文章</router-link>
      </nav>
      <nav>
        <a href="http://1.95.141.194/" target="_blank" class="link-primary"
          >项目实验</a
        >
      </nav>
      <QThemeToggle size="20" />
      <QIcon icon="Menu" size="20" @click="visible = !visible" />
    </div>
    <QDrawer v-model:visible="visible" direction="left">
      <template #default>
        <SiderBar />
      </template>
    </QDrawer>
  </header>
</template>

<script lang="ts" setup>
import { QDrawer, QThemeToggle, QIcon } from "qyani-components";
import SiderBar from "./SiderBar.vue";
import { ref } from "vue";
const visible = ref(true);
</script>
