## **3. 使用 Windows API**

Windows 提供了自己的线程管理 API，适用于 Windows 系统。

### **3.1 创建线程**

- 使用 `CreateThread` 函数创建线程。
- **语法**：

  ```c
  HANDLE CreateThread(
      LPSECURITY_ATTRIBUTES lpThreadAttributes,
      SIZE_T dwStackSize,
      LPTHREAD_START_ROUTINE lpStartAddress,
      LPVOID lpParameter,
      DWORD dwCreationFlags,
      LPDWORD lpThreadId
  );
  ```

  - `lpStartAddress`：线程启动时调用的函数。
  - `lpParameter`：传递给线程函数的参数。

- **示例**：

  ```c
  #include <stdio.h>
  #include <windows.h>

  DWORD WINAPI printMessage(LPVOID message) {
      printf("Thread: %s\n", (char *)message);
      return 0;
  }

  int main() {
      HANDLE thread;
      char *msg = "Hello from thread!";
      
      thread = CreateThread(NULL, 0, printMessage, (LPVOID)msg, 0, NULL);
      if (thread == NULL) {
          fprintf(stderr, "Failed to create thread.\n");
          return -1;
      }

      // 等待线程结束
      WaitForSingleObject(thread, INFINITE);

      printf("Main thread finished.\n");
      CloseHandle(thread);
      return 0;
  }
  ```

---

### **3.2 等待线程结束**

- 使用 `WaitForSingleObject` 等待线程完成。
- **语法**：

  ```c
  DWORD WaitForSingleObject(HANDLE hHandle, DWORD dwMilliseconds);
  ```

  - `hHandle`：线程句柄。
  - `dwMilliseconds`：等待时间（`INFINITE` 表示无限等待）。

- **示例**：

  ```c
  WaitForSingleObject(thread, INFINITE);
  ```

---

### **3.3 关闭线程句柄**

- 使用 `CloseHandle` 关闭线程句柄。
- **语法**：

  ```c
  BOOL CloseHandle(HANDLE hObject);
  ```

- **示例**：

  ```c
  CloseHandle(thread);
  ```

---