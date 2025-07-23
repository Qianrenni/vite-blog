# 5. Dockerfile：构建镜像的配方文件

## 📝 示例 Dockerfile

```Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

## 🛠️ 构建镜像

```bash
docker build -t my-flask-app .
```

---