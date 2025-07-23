# 7. 网络（Networking）：容器间通信

## 🌐 创建自定义网络

```bash
docker network create my_network
```

## 🔄 将容器加入网络

```bash
docker run --network my_network --name webserver nginx
docker run --network my_network --name db mysql
```

这样两个容器就可以通过名称互相访问：

```bash
ping webserver
ping db
```

---