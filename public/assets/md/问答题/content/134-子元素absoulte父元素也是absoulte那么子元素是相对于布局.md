##  子元素absoulte，父元素也是absoulte，那么子元素是相对于布局
```text
当一个子元素的 `position` 为 `absolute`，而其父元素的 `position` 也为 `absolute`（或 `relative`、`fixed`、`sticky`）时，子元素会相对于该父元素进行定位。这是因为绝对定位元素始终相对于最近的非 `static` 定位祖先元素布局。若所有祖先均为默认的 `static` 定位，则子元素将相对于初始包含块（通常是视口）定位。
```