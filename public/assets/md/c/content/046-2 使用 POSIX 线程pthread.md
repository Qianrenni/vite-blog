## **2. 使用 POSIX 线程（`pthread`）**

POSIX 线程是跨平台的线程库，广泛用于 Linux 和 macOS 系统。

### **2.1 创建线程**

- 使用 `pthread_create` 函数创建线程。
- **语法**：

  ```c
  int pthread_create(pthread_t *thread, const pthread_attr_t *attr,
                     void *(*start_routine)(void *), void *arg);
  ```

  - `thread`：指向线程标识符的指针。
  - `attr`：线程属性（通常为 `NULL` 表示默认属性）。
  - `start_routine`：线程启动时调用的函数。
  - `arg`：传递给线程函数的参数。

- **示例**：

  ```c
  #include <stdio.h>
  #include <pthread.h>

  void *printMessage(void *message) {
      printf("Thread: %s\n", (char *)message);
      return NULL;
  }

  int main() {
      pthread_t thread;
      char *msg = "Hello from thread!";
      
      if (pthread_create(&thread, NULL, printMessage, (void *)msg) != 0) {
          perror("Failed to create thread");
          return -1;
      }

      // 等待线程结束
      pthread_join(thread, NULL);

      printf("Main thread finished.\n");
      return 0;
  }
  ```

---

### **2.2 等待线程结束**

- 使用 `pthread_join` 等待线程完成。
- **语法**：

  ```c
  int pthread_join(pthread_t thread, void **retval);
  ```

  - `thread`：要等待的线程。
  - `retval`：存储线程返回值的指针（可选）。

- **示例**：

  ```c
  pthread_join(thread, NULL);  // 等待线程结束
  ```

---

### **2.3 终止线程**

- 使用 `pthread_exit` 主动终止线程。
- **语法**：

  ```c
  void pthread_exit(void *retval);
  ```

  - `retval`：线程的返回值。

- **示例**：

  ```c
  pthread_exit(NULL);
  ```

---