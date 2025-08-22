<template>
  <div class=" container-column container-align-center">
    <!-- Hero Section -->
    <section class="text-secondary container-column container-align-center gap container-space-evenly" style="min-height: 400px;">
      <h1>你好！我是QYANI</h1>
      <p>计算机专业学生 · 知识分享者</p>
      <router-link to="/about" class="button">了解更多</router-link>
    </section>

    <!-- 中间区域 - 展示有趣的页面效果 -->
    <section class="show-container text-secondary  container-column container-space-around" style="max-width: 800px;width: 100%;height: 300px;">
      <div class="container-space-around container-align-center">
        <div class="loader-nature">
          <div class="ripple"></div>
          <div class="ripple"></div>
          <div class="ripple"></div>
        </div>
        <div class="loader-tech"></div>
        <div class="loader-nature">
          <div class="ripple"></div>
          <div class="ripple"></div>
          <div class="ripple"></div>
        </div>
      </div>
      <div class="container-space-around container-align-center">
        <div class="loader-tech"></div>
        <div class="loader-nature">
          <div class="ripple"></div>
          <div class="ripple"></div>
          <div class="ripple"></div>
        </div>
        <div class="loader-tech"></div>
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
.show-container{
  background: url('public/images/bg1.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 50%;
}
</style>
