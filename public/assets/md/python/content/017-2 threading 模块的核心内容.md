## **2. `threading` 模块的核心内容**

### （1）创建线程

可以通过以下两种方式创建线程：

- **继承 `Thread` 类**：自定义一个类继承 `threading.Thread`，重写其 `run()` 方法。
- **使用 `Thread` 构造函数**：直接将目标函数传递给 `Thread` 构造函数。

- 示例 1：继承 `Thread` 类

```python
import threading
import time

class MyThread(threading.Thread):
    def __init__(self, name, delay):
        super().__init__()
        self.name = name
        self.delay = delay

    def run(self):
        print(f"Thread {self.name} started.")
        for i in range(5):
            time.sleep(self.delay)
            print(f"{self.name}: {i}")
        print(f"Thread {self.name} finished.")

# 创建线程实例
thread1 = MyThread("Thread-1", 1)
thread2 = MyThread("Thread-2", 2)

# 启动线程
thread1.start()
thread2.start()

# 等待线程完成
thread1.join()
thread2.join()

print("All threads finished.")
```

- 示例 2：使用 `Thread` 构造函数

```python
import threading
import time

def worker(name, delay):
    print(f"Thread {name} started.")
    for i in range(5):
        time.sleep(delay)
        print(f"{name}: {i}")
    print(f"Thread {name} finished.")

# 创建线程
thread1 = threading.Thread(target=worker, args=("Thread-1", 1))
thread2 = threading.Thread(target=worker, args=("Thread-2", 2))

# 启动线程
thread1.start()
thread2.start()

# 等待线程完成
thread1.join()
thread2.join()

print("All threads finished.")
```

---

### （2）线程管理方法

`threading.Thread` 提供了一些常用的方法来管理线程：

- `start()`：启动线程，调用线程的 `run()` 方法。
- `join([timeout])`：阻塞主线程，直到子线程完成（或超时）。
- `is_alive()`：检查线程是否还在运行。
- `getName()` 和 `setName(name)`：获取或设置线程名称。

- 示例：线程状态检查

```python
import threading
import time

def worker():
    print(f"Thread {threading.current_thread().name} is running.")
    time.sleep(2)
    print(f"Thread {threading.current_thread().name} is done.")

thread = threading.Thread(target=worker, name="MyWorkerThread")
thread.start()

print(f"Is thread alive? {thread.is_alive()}")
thread.join()
print(f"Is thread alive? {thread.is_alive()}")
```

---

### （3）线程同步

当多个线程访问共享资源时，可能会出现竞争条件（Race Condition）。为了解决这个问题，可以使用以下同步机制：

- **Lock**：互斥锁，确保同一时间只有一个线程访问共享资源。
- **RLock**：可重入锁，允许同一个线程多次获取锁。

- **Condition**：条件变量，用于线程间的通信。

    ```python
    import threading

    # 创建一个条件变量
    condition = threading.Condition()

    # 共享资源
    shared_resource = False

    def consumer():
        global shared_resource
        with condition:  # 获取条件变量的锁
            print("Consumer is waiting...")
            while not shared_resource:  # 等待条件满足
                condition.wait()  # 类似于 Java 的 wait()
            print("Consumer found the resource ready!")

    def producer():
        global shared_resource
        with condition:  # 获取条件变量的锁
            print("Producer is preparing the resource...")
            shared_resource = True
            condition.notify()  # 唤醒等待的线程，类似于 Java 的 notify()

    # 创建线程
    t1 = threading.Thread(target=consumer)
    t2 = threading.Thread(target=producer)

    # 启动线程
    t1.start()
    t2.start()

    # 等待线程完成
    t1.join()
    t2.join()
    ```

- **Semaphore**：信号量，控制同时访问资源的线程数量。

- 示例：使用 Lock

```python
import threading

# 共享资源
counter = 0
lock = threading.Lock()

def increment():
    global counter
    for _ in range(100000):
        with lock:  # 加锁
            counter += 1

# 创建线程
thread1 = threading.Thread(target=increment)
thread2 = threading.Thread(target=increment)

# 启动线程
thread1.start()
thread2.start()

# 等待线程完成
thread1.join()
thread2.join()

print(f"Final counter value: {counter}")
```

---

### （4）守护线程（Daemon Thread）

守护线程是一种后台线程，当主线程结束时，守护线程会自动退出。可以通过设置 `daemon=True` 来创建守护线程。

- 示例：守护线程

```python
import threading
import time

def daemon_worker():
    while True:
        print("Daemon thread is running...")
        time.sleep(1)

# 创建守护线程
daemon_thread = threading.Thread(target=daemon_worker, daemon=True)
daemon_thread.start()

print("Main thread is running...")
time.sleep(3)
print("Main thread finished.")
```

输出：

```
Main thread is running...
Daemon thread is running...
Daemon thread is running...
Daemon thread is running...
Main thread finished.
```

注意：守护线程会在主线程结束后自动终止。

---