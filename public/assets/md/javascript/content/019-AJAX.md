## **AJAX**

AJAX（Asynchronous JavaScript and XML）是一种在不重新加载整个页面的情况下，与服务器进行异步通信的技术。它允许开发者动态地更新网页内容，从而提升用户体验。以下是关于 AJAX 的两种实现方式的详细讲解：**原生 AJAX 请求（`XMLHttpRequest`）** 和 **Fetch API**。

---

### **1. 原生 AJAX 请求：`XMLHttpRequest`**

`XMLHttpRequest` 是最早的 AJAX 实现方式，尽管它语法较繁琐，但仍然被广泛支持。

#### **1.1 基本流程**

1. **创建 `XMLHttpRequest` 对象**。
2. **配置请求**：
   - 设置请求方法（GET、POST 等）。
   - 设置请求 URL。
   - 设置是否异步。
3. **发送请求**。
4. **监听响应状态**，处理成功或失败的结果。

#### **1.2 示例**

以下是一个使用 `XMLHttpRequest` 发送 GET 请求并处理响应的完整示例：

```javascript
// 创建 XMLHttpRequest 对象
const xhr = new XMLHttpRequest();

// 配置请求
xhr.open("GET", "https://jsonplaceholder.typicode.com/posts/1", true); // true 表示异步

// 设置响应类型（可选）
xhr.responseType = "json";

// 监听请求状态变化
xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) { // 请求完成
        if (xhr.status === 200) { // 成功
            console.log("Response:", xhr.response);
        } else { // 失败
            console.error("Error:", xhr.status, xhr.statusText);
        }
    }
};

// 发送请求
xhr.send();
```

#### **1.3 关键点**

- **`open(method, url, async)`**：
  - `method`：HTTP 方法（如 `GET`、`POST`）。
  - `url`：目标地址。
  - `async`：是否异步（默认为 `true`）。
- **`send(body)`**：
  - 如果是 `GET` 请求，通常不需要传递 `body`。
  - 如果是 `POST` 请求，可以通过 `send` 方法传递数据。
- **`onreadystatechange`**：
  - 监听请求状态的变化。
  - `readyState` 的值：
    - `0`：未初始化。
    - `1`：已建立连接。
    - `2`：请求已接收。
    - `3`：正在处理。
    - `4`：请求完成。
- **`status`**：
  - HTTP 状态码（如 `200` 表示成功，`404` 表示未找到资源）。

#### **1.4 POST 请求示例**

以下是一个使用 `XMLHttpRequest` 发送 POST 请求并传递数据的示例：

```javascript
const xhr = new XMLHttpRequest();
xhr.open("POST", "https://jsonplaceholder.typicode.com/posts", true);
xhr.setRequestHeader("Content-Type", "application/json");

xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 201) { // 201 表示资源已创建
            console.log("Response:", xhr.response);
        } else {
            console.error("Error:", xhr.status, xhr.statusText);
        }
    }
};

const data = JSON.stringify({
    title: "foo",
    body: "bar",
    userId: 1
});

xhr.send(data);
```

---

### **2. Fetch API：`fetch(url).then().catch()`**

Fetch API 是现代浏览器提供的更简洁、更强大的 AJAX 工具。它是基于 Promise 的，语法更加直观。

#### **2.1 基本语法**

```javascript
fetch(url, options)
    .then(response => response.json()) // 解析响应数据
    .then(data => {
        console.log("Data:", data);
    })
    .catch(error => {
        console.error("Error:", error);
    });
```

- **`url`**：请求的目标地址。
- **`options`**（可选）：包含请求方法、请求头、请求体等配置的对象。
- **`response`**：
  - 包含服务器返回的原始响应。
  - 使用 `response.json()` 或 `response.text()` 等方法解析响应数据。

#### **2.2 示例**

以下是一个使用 `fetch` 发送 GET 请求并处理响应的示例：

```javascript
fetch("https://jsonplaceholder.typicode.com/posts/1")
    .then(response => {
        if (!response.ok) { // 检查响应状态
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // 解析为 JSON
    })
    .then(data => {
        console.log("Post:", data);
    })
    .catch(error => {
        console.error("Error:", error);
    });
```

#### **2.3 POST 请求示例**

以下是一个使用 `fetch` 发送 POST 请求并传递数据的示例：

```javascript
const data = {
    title: "foo",
    body: "bar",
    userId: 1
};

fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST", // 请求方法
    headers: {
        "Content-Type": "application/json" // 设置请求头
    },
    body: JSON.stringify(data) // 将数据转换为 JSON 字符串
})
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Created Post:", data);
    })
    .catch(error => {
        console.error("Error:", error);
    });
```

#### **2.4 错误处理**

- **网络错误**：
  - 如果请求无法到达服务器（如网络中断），会触发 `.catch`。
- **HTTP 错误**：
  - 如果服务器返回非 2xx 状态码（如 404 或 500），需要手动检查 `response.ok`。

#### **2.5 高级功能**

- **中止请求**：
  - 使用 `AbortController` 中止请求。

  ```javascript
  const controller = new AbortController();
  const signal = controller.signal;

  fetch("https://jsonplaceholder.typicode.com/posts/1", { signal })
      .then(response => response.json())
      .then(data => {
          console.log("Post:", data);
      })
      .catch(error => {
          if (error.name === "AbortError") {
              console.log("Request aborted");
          } else {
              console.error("Error:", error);
          }
      });

  // 中止请求
  setTimeout(() => controller.abort(), 1000);
  ```

---