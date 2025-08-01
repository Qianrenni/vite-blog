# **HTTP和HTTPS的区别**

| 特性/协议 | HTTP | HTTPS |
| --- | --- | --- |
| **全称** | HyperText Transfer Protocol（超文本传输协议） | HyperText Transfer Protocol Secure（安全的超文本传输协议） |
| **安全性** | 不加密，数据以明文形式传输，容易被窃听和篡改。 | 使用SSL/TLS加密技术，确保数据传输的安全性和完整性。 |
| **数据完整性** | 无机制保证数据在传输过程中不被篡改。 | 提供数据完整性检查，防止数据在传输过程中被修改。 |
| **认证** | 无法验证通信双方的身份。 | 通过数字证书验证服务器身份，可选支持客户端身份验证。 |
| **性能** | 理论上略优于HTTPS，因为不需要额外的加密解密操作。 | 加密解密会消耗额外资源，但随着技术进步，影响已大大减小，并可能通过HTTP/2等提供更好的性能。 |
| **SEO影响** | 搜索引擎没有特别偏好。 | 搜索引擎如Google更倾向于HTTPS站点，有助于提高SEO排名。 |
| **URL显示** | `http://`开头，通常没有特殊标志。 | `https://`开头，浏览器地址栏常有挂锁图标表示安全连接。 |
| **端口号** | 默认80端口。 | 默认443端口。 |
| **应用场景** | 适用于对安全性要求不高、公开的信息交流。 | 适用于涉及敏感信息（如登录凭证、支付信息等）的网站和服务。 |
| **成本** | 无需额外费用。 | 需要购买SSL/TLS证书，可能会产生一定的成本。 |