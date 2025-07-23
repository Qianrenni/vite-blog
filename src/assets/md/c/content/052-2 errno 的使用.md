## **2. `errno` 的使用**

`errno` 是一个全局变量，用于存储错误代码。它通常与系统调用或标准库函数一起使用，帮助开发者识别错误类型。

### **2.1 `errno` 的工作原理**

- 当函数执行失败时，会将特定的错误代码写入 `errno`。
- 程序可以通过检查 `errno` 来确定错误的具体原因。
- 示例：

  ```c
  #include <stdio.h>
  #include <errno.h>
  #include <string.h>

  int main() {
      FILE *file = fopen("missing_file.txt", "r");
      if (file == NULL) {
          printf("Error code: %d\n", errno);       // 打印错误代码
          printf("Error message: %s\n", strerror(errno));  // 打印错误描述
      }
      return 0;
  }
  ```

---

### **2.2 常见的 `errno` 错误代码**

| 错误代码   | 描述                                   |
|------------|----------------------------------------|
| `EPERM`    | 操作不允许                            |
| `ENOENT`   | 文件或目录不存在                      |
| `ENOMEM`   | 内存不足                              |
| `EACCES`   | 权限不足                              |
| `EINVAL`   | 无效参数                              |
| `EIO`      | 输入/输出错误                         |

---

### **2.3 清除 `errno`**

- 在某些情况下，`errno` 可能会被设置为非零值，即使没有发生错误。
- 因此，在检测错误之前应先将 `errno` 设置为 `0`。
- 示例：

  ```c
  #include <stdio.h>
  #include <errno.h>
  #include <string.h>

  int main() {
      errno = 0;  // 初始化 errno
      FILE *file = fopen("missing_file.txt", "r");
      if (file == NULL && errno != 0) {
          printf("Error: %s\n", strerror(errno));
      }
      return 0;
  }
  ```

---