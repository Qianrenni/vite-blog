# 6. Volume：持久化数据管理

## 📂 挂载命名卷（Named Volume）

```yaml
volumes:
  - my_data:/path/in/container
```

## 💾 挂载本地目录（Bind Mount）

```bash
docker run -v D:/data:/app/data myapp
```

## 🧼 管理卷

```bash
docker volume ls
docker volume inspect my_data
docker volume rm my_data
```

---