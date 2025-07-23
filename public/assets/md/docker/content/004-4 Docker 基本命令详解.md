# 4. Docker 基本命令详解

## 🔍 查看版本信息

```bash
docker --version
docker info
```

## 🐣 镜像相关操作

```bash
docker images            # 列出本地所有镜像
docker pull ubuntu       # 从远程拉取镜像
docker build -t myapp .  # 构建镜像
docker rmi ubuntu        # 删除镜像
```

## 📦 容器相关操作

```bash
docker run hello-world   # 运行一个容器
docker ps                # 查看正在运行的容器
docker ps -a             # 查看所有容器（包括停止的）
docker stop <container>  # 停止容器
docker rm <container>    # 删除容器
docker logs <container>  # 查看容器日志
```

## 📥 数据挂载与目录共享

```bash
docker run -v /宿主机路径:/容器路径 myapp
```

例如：

```bash
docker run -v D:/data:/app/data myapp
```

## 🌐 网络操作

```bash
docker network create mynet
docker network ls
docker network inspect mynet
```

---