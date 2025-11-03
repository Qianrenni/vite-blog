### ✅ 方法二：使用 `clip-path`（现代浏览器支持）

如果你知道镂空区域的位置和尺寸，也可以用 `clip-path` 创建一个“带洞”的遮罩：

```html
<div class="overlay-with-hole"></div>
```

```css
.overlay-with-hole {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  /* 挖一个矩形洞：x=200, y=100, w=200, h=100 */
  clip-path: polygon(
    0 0,
    100% 0,
    100% 100%,
    0 100%,
    0 0,
    200px 100px,
    400px 100px,
    400px 200px,
    200px 200px,
    200px 100px
  );
  z-index: 9999;
}
```

> ⚠️ 注意：`clip-path` 路径需闭合，且“挖洞”部分要反向绘制（形成镂空）。

---