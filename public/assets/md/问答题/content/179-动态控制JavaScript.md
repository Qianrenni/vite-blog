### 📌 动态控制（JavaScript）

如果你需要用 JS 动态高亮某个元素（比如按钮）：

```js
function highlightElement(el) {
  const rect = el.getBoundingClientRect();
  const hole = document.createElement('div');
  hole.className = 'hole';
  hole.style.cssText = `
    position: fixed;
    top: ${rect.top}px;
    left: ${rect.left}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    background: transparent;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
    z-index: 10000;
    pointer-events: none;
  `;
  document.body.appendChild(hole);
  return hole; // 用于后续移除
}

// 使用示例
const btn = document.querySelector('#myButton');
const highlight = highlightElement(btn);

// 3秒后移除
setTimeout(() => highlight.remove(), 3000);
```

---