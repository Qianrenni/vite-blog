## 总结：JavaScript 安全防护 checklist

| 风险 | 防护措施 |
|------|----------|
| **XSS** | 输出编码、CSP、避免 `innerHTML`、使用 sanitizer |
| **CSRF** | CSRF Token、SameSite Cookie、验证 Origin |
| **注入攻击** | 参数化查询、输入验证、避免 `eval` |
| **安全头** | 设置 CSP、HSTS、X-Frame-Options 等 |
| **输入安全** | 白名单验证、长度限制、类型检查 |
| **权限控制** | 服务端验证、最小权限、操作日志 |
| **依赖安全** | 定期 `npm audit`、使用 Snyk 监控 |
| **审计流程** | 代码审查、渗透测试、自动化扫描 |

---