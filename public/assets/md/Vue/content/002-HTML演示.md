# HTML演示
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vue示例</title>
    <script src="./test.js" type="module"></script>
</head>
<body>
  <p id="count">--</p>
  <button id="btn">点击</button>
  <img src="" alt="">
  <!-- 先加载响应式系统 -->

  <!-- 再写业务逻辑 -->
  <script type="module">
    import { reactive, effect } from './test.js';
    const state = reactive({ count: 0, imageUrl:'' });

    // 响应式副作用：自动更新 DOM
    effect(() => {
      document.getElementById('count').innerText = state.count;
      document.querySelector('img').src = state.imageUrl;
    });

    // 按钮点击事件
    document.getElementById('btn').addEventListener('click', () => {
      state.count++;
      state.imageUrl = 'https://picsum.photos/200/300?random=' + state.count;
    });
  </script>
</body>
</html>
```