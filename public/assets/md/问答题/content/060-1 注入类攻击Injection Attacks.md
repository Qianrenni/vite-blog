### 1. 注入类攻击（Injection Attacks）

#### （1）SQL 注入（SQL Injection, SQLi）

- **原理**：攻击者通过在输入字段中插入恶意 SQL 语句，欺骗后端数据库执行非授权操作。
- **危害**：可读取、修改、删除数据库内容，甚至执行系统命令（如通过 xp_cmdshell）。
- **防御**：使用参数化查询（Prepared Statements）、输入验证、最小权限原则、Web 应用防火墙（WAF）。

#### （2）命令注入（Command Injection）

- **原理**：应用程序将用户输入直接拼接到系统命令中执行。
- **示例**：`ping` 命令后拼接用户输入，攻击者输入 `; rm -rf /`。
- **防御**：避免直接调用系统命令；如必须使用，严格过滤和转义输入。

#### （3）LDAP / XPath / NoSQL 注入

- 类似 SQL 注入，但针对 LDAP 查询、XPath 表达式或 MongoDB 等 NoSQL 数据库。
- **防御**：使用安全 API、输入验证、避免动态拼接查询。

---