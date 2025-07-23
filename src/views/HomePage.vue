<template>
  <div class="container-column container-align-center">
    <!-- Hero Section -->
    <section class="text-secondary container-column container-align-center gap container-space-evenly" style="min-height: 400px;">
      <h1>你好！我是QIANRENNI</h1>
      <p>计算机专业学生 · 知识分享者</p>
      <router-link to="/about" class="button">了解更多</router-link>
    </section>

    <!-- 中间区域 - 展示有趣的页面效果 -->
    <section class="text-secondary border-primary container-column container-space-around" style="max-width: 800px;width: 100%;height: 300px;">
      <div class="animated-box bg-primary "/>
      <div class="container-space-between">
        <div class="animated-box bg-primary "/>
        <div class="animated-box bg-primary "  />
      </div>
    </section>

    <!-- Footer -->
    <footer class="text-secondary bg-card container-column container-align-center " style="width: 100%;">
      <p>© 2025 QYANI 的个人博客</p>
      <div class="  container-column container-align-center ">
        <a class="link-primary">邮箱 3092176591@qq.com</a>
        <a class="link-primary" href="https://gitee.com/Qianrenni " target="_blank">Gitee</a>
      </div>
    </footer>
  </div>
</template>
<script lang="ts" setup>
defineOptions({
  name: "HomePage",
});
</script>
<style scoped>

.animated-box {
  width: 100px;
  height: 100px;
  animation: bounce-spin 2s infinite ease-in-out;
  margin: 0 auto;
  border-radius: 8px;
}
@keyframes bounce-spin {
  0%, 100% {
    opacity: 1;
    transform: translateY(0) rotateZ(0deg);
  }
  50% {
    transform: translateY(-25px) rotateZ(180deg);
    opacity: 0.5;
  }
  75% {
    transform: translateY(-10px) rotateZ(540deg);
  }
}


/* 响应式媒体查询 */
@media (max-width: 768px) {
  .animated-box {
    width: 80px;
    height: 80px;
  }
}
</style>