# 9. Docker 与 CI/CD 集成

## 🧱 构建自动化流程

```yaml
# .github/workflows/docker-build.yml (GitHub Actions 示例)
name: Build and Push Docker Image

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build the Docker image
        run: |
          docker build . -t yourusername/myapp
      - name: Push to Docker Hub
        run: |
          docker login -u ${{ secrets.DOCKER_USER }} -p ${{ secrets.DOCKER_PASS }}
          docker push yourusername/myapp
```

---