### 3. 跨站请求伪造（Cross-Site Request Forgery, CSRF）

- **原理**：攻击者诱使已登录用户在不知情的情况下向目标网站发送恶意请求（如转账、改密码）。
- **前提**：用户已认证且浏览器自动携带 Cookie。
- **防御**：
    - 使用 Anti-CSRF Token（同步令牌）；
    - 检查 Referer/Origin 头；
    - 关键操作使用二次验证（如短信验证码）。

---