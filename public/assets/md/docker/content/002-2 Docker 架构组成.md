# 2. Docker 架构组成

Docker 使用客户端-服务端架构：

- **Docker Client（客户端）**：用户使用的命令行工具（`docker` 命令）
- **Docker Daemon（守护进程）**：负责管理镜像、容器、网络等
- **Docker Registry（仓库）**：存储和分发镜像的地方（如 Docker Hub）

```
+-------------------+
|   Docker Client   |
+-------------------+
         |
         v
+-------------------+
| Docker Daemon     |
| - Images          |
| - Containers      |
| - Volumes         |
| - Networks        |
+-------------------+
         |
         v
+-------------------+
| Docker Registry   |
| (e.g., Docker Hub)|
+-------------------+
```

---