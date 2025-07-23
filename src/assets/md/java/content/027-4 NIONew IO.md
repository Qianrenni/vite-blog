## **4. NIO（New I/O）**

### **4.1 缓冲区（Buffer）**

- **定义**：
  - 缓冲区是 NIO 的核心组件，用于存储数据。
  - 常见类型：`ByteBuffer`, `CharBuffer`, `IntBuffer` 等。
- **基本操作**：
  - `put()`：向缓冲区写入数据。
  - `get()`：从缓冲区读取数据。
  - `flip()`：切换到读模式。
  - `clear()`：清空缓冲区，切换到写模式。

#### **示例：使用 ByteBuffer**

```java
import java.nio.ByteBuffer;

public class BufferExample {
    public static void main(String[] args) {
        ByteBuffer buffer = ByteBuffer.allocate(10);

        // 写入数据
        buffer.put((byte) 1);
        buffer.put((byte) 2);

        // 切换到读模式
        buffer.flip();

        // 读取数据
        while (buffer.hasRemaining()) {
            System.out.println(buffer.get());
        }

        // 清空缓冲区
        buffer.clear();
    }
}
```

---

### **4.2 通道（Channel）**

- **定义**：
  - 通道是数据传输的载体，支持双向读写。
- **常用类**：
  - `FileChannel`：用于文件操作。
  - `SocketChannel` 和 `ServerSocketChannel`：用于网络通信。

#### **示例：使用 FileChannel 复制文件**

```java
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.channels.FileChannel;

public class FileChannelExample {
    public static void main(String[] args) throws Exception {
        FileInputStream in = new FileInputStream("source.txt");
        FileOutputStream out = new FileOutputStream("target.txt");

        FileChannel inChannel = in.getChannel();
        FileChannel outChannel = out.getChannel();

        outChannel.transferFrom(inChannel, 0, inChannel.size());

        inChannel.close();
        outChannel.close();
        in.close();
        out.close();
    }
}
```

---

### **4.3 文件锁与内存映射文件**

#### **文件锁**

- **作用**：
  - 防止多个进程同时修改同一文件。
- **示例**：

  ```java
  import java.io.RandomAccessFile;
  import java.nio.channels.FileChannel;
  import java.nio.channels.FileLock;

  public class FileLockExample {
      public static void main(String[] args) throws Exception {
          RandomAccessFile file = new RandomAccessFile("test.txt", "rw");
          FileChannel channel = file.getChannel();

          FileLock lock = channel.lock(); // 加锁
          System.out.println("File is locked.");

          lock.release(); // 解锁
          System.out.println("File is unlocked.");

          channel.close();
          file.close();
      }
  }
  ```

#### **内存映射文件**

- **定义**：
  - 将文件直接映射到内存中，提高文件读写效率。
- **示例**：

  ```java
  import java.io.RandomAccessFile;
  import java.nio.MappedByteBuffer;
  import java.nio.channels.FileChannel;

  public class MappedFileExample {
      public static void main(String[] args) throws Exception {
          RandomAccessFile file = new RandomAccessFile("test.txt", "rw");
          FileChannel channel = file.getChannel();

          MappedByteBuffer buffer = channel.map(FileChannel.MapMode.READ_WRITE, 0, channel.size());
          buffer.put(0, (byte) 'H');
          buffer.put(1, (byte) 'i');

          channel.close();
          file.close();
      }
  }
  ```

---