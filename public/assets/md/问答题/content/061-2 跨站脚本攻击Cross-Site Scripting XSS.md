### 2. 跨站脚本攻击（Cross-Site Scripting, XSS）

- **原理**：攻击者向网页注入恶意脚本（通常是 JavaScript），在其他用户浏览器中执行。
- **类型**：
    - **反射型 XSS**：恶意脚本通过 URL 参数反射回页面（如搜索框）。
    - **存储型 XSS**：恶意脚本被存储在服务器（如评论区），所有访问者都会执行。
    - **DOM 型 XSS**：脚本通过修改页面 DOM 结构触发，不涉及服务器响应。
- **危害**：窃取 Cookie、会话令牌、钓鱼、重定向等。
- **防御**：
    - 对输出进行 HTML 编码（Context-aware escaping）；
    - 使用 Content Security Policy（CSP）；
    - 设置 HttpOnly 和 Secure 标志的 Cookie。

---