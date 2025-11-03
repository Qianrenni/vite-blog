### 8. 敏感数据泄露（Sensitive Data Exposure）

- **原因**：
    - 未加密传输（HTTP 而非 HTTPS）；
    - 密码明文存储；
    - 日志记录敏感信息。
- **防御**：
    - 强制使用 HTTPS（HSTS）；
    - 使用强哈希（如 bcrypt）存储密码；
    - 敏感数据脱敏。

---