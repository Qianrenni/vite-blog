# 8. Docker Compose：多服务编排工具

## 📄 示例 `docker-compose.yml`

```yaml
version: '3'
services:
  web:
    image: myweb
    ports:
      - "80:80"
  db:
    image: mysql:5.7
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
```

## 🚀 启动服务

```bash
docker-compose up -d
```

## 🛑 停止并删除服务

```bash
docker-compose down
```

---