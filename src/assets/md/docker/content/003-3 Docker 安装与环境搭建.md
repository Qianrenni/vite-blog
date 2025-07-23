# 3. Docker 安装与环境搭建

## ✅ Windows 安装

推荐使用 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)

- 支持 WSL2（推荐）
- 自带图形界面（GUI）
- 可以轻松切换 Linux/Windows 容器模式

## ✅ Linux 安装（Ubuntu）

```bash
sudo apt update
sudo apt install docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

> 重启终端或重新登录使 `docker` 用户组生效。

---