## 5.2 Channel

### Channel基本概念

```go
import (
    "fmt"
    "time"
)

func main() {
    // 创建无缓冲channel
    ch1 := make(chan string)
    
    // 创建有缓冲channel
    ch2 := make(chan int, 3)
    
    // 启动Goroutine发送数据
    go func() {
        ch1 <- "Hello"
        ch2 <- 1
        ch2 <- 2
        ch2 <- 3
        // ch2 <- 4  // 这会阻塞，因为缓冲区已满
    }()
    
    // 接收数据
    msg := <-ch1
    fmt.Println(msg)
    
    // 从缓冲channel接收数据
    for i := 0; i < 3; i++ {
        value := <-ch2
        fmt.Println(value)
    }
}
```

### Channel创建和使用

```go
import (
    "fmt"
    "sync"
)

// 不同类型的channel
func demonstrateChannels() {
    // 字符串channel
    stringChan := make(chan string, 2)
    
    // 整数channel
    intChan := make(chan int, 3)
    
    // 结构体channel
    type Person struct {
        Name string
        Age  int
    }
    personChan := make(chan Person, 1)
    
    var wg sync.WaitGroup
    
    // 发送数据的Goroutine
    wg.Add(1)
    go func() {
        defer wg.Done()
        stringChan <- "Hello"
        stringChan <- "World"
        intChan <- 42
        intChan <- 100
        intChan <- 200
        personChan <- Person{Name: "Alice", Age: 30}
    }()
    
    // 接收数据的Goroutine
    wg.Add(1)
    go func() {
        defer wg.Done()
        fmt.Println(<-stringChan)
        fmt.Println(<-stringChan)
        fmt.Println(<-intChan)
        fmt.Println(<-intChan)
        fmt.Println(<-intChan)
        person := <-personChan
        fmt.Printf("Person: %s, Age: %d\n", person.Name, person.Age)
    }()
    
    wg.Wait()
}
```

### 有缓冲和无缓冲Channel

```go
import (
    "fmt"
    "time"
)

// 无缓冲channel - 同步通信
func unbufferedChannel() {
    ch := make(chan string)
    
    go func() {
        fmt.Println("Goroutine: About to send")
        ch <- "Hello"  // 阻塞直到有接收者
        fmt.Println("Goroutine: Message sent")
    }()
    
    time.Sleep(time.Second)  // 确保Goroutine先运行
    fmt.Println("Main: About to receive")
    msg := <-ch  // 阻塞直到有发送者
    fmt.Println("Main: Received", msg)
}

// 有缓冲channel - 异步通信
func bufferedChannel() {
    ch := make(chan string, 2)  // 缓冲区大小为2
    
    fmt.Println("Sending first message")
    ch <- "First"  // 不会阻塞
    
    fmt.Println("Sending second message")
    ch <- "Second"  // 不会阻塞
    
    fmt.Println("Sending third message")
    // ch <- "Third"  // 这会阻塞，因为缓冲区已满
    
    fmt.Println("Receiving messages")
    fmt.Println(<-ch)  // First
    fmt.Println(<-ch)  // Second
    // fmt.Println(<-ch)  // 这会阻塞，因为缓冲区为空
}

func main() {
    fmt.Println("=== Unbuffered Channel ===")
    unbufferedChannel()
    
    fmt.Println("\n=== Buffered Channel ===")
    bufferedChannel()
}
```

### Channel方向（发送、接收）

```go
import "fmt"

// 只发送channel
func sender(ch chan<- string) {
    ch <- "Hello from sender"
    ch <- "Another message"
    // msg := <-ch  // 编译错误：不能从只发送channel接收
}

// 只接收channel
func receiver(ch <-chan string) {
    msg1 := <-ch
    msg2 := <-ch
    fmt.Println("Received:", msg1, msg2)
    // ch <- "Hello"  // 编译错误：不能向只接收channel发送
}

// 双向channel可以转换为单向channel
func processor(input <-chan int, output chan<- string) {
    for num := range input {
        output <- fmt.Sprintf("Processed: %d", num*2)
    }
    close(output)
}

func main() {
    // 基本的发送/接收方向
    ch := make(chan string, 2)
    go sender(ch)
    receiver(ch)
    
    // 管道模式
    input := make(chan int, 3)
    output := make(chan string, 3)
    
    // 发送数据
    go func() {
        input <- 1
        input <- 2
        input <- 3
        close(input)
    }()
    
    // 处理数据
    go processor(input, output)
    
    // 接收结果
    for result := range output {
        fmt.Println(result)
    }
}
```

### Channel关闭和遍历

```go
import (
    "fmt"
    "sync"
)

func demonstrateChannelClose() {
    ch := make(chan int, 3)
    var wg sync.WaitGroup
    
    // 发送者
    wg.Add(1)
    go func() {
        defer wg.Done()
        for i := 1; i <= 5; i++ {
            ch <- i
        }
        close(ch)  // 关闭channel
        // ch <- 6  // 这会导致panic
    }()
    
    // 接收者 - 使用range遍历
    wg.Add(1)
    go func() {
        defer wg.Done()
        for value := range ch {
            fmt.Println("Received:", value)
        }
        fmt.Println("Channel closed, range loop ended")
    }()
    
    wg.Wait()
}

// 检测channel是否关闭
func checkChannelClose() {
    ch := make(chan int, 2)
    ch <- 1
    ch <- 2
    close(ch)
    
    // 方式1：使用range（推荐）
    for value := range ch {
        fmt.Println("Range:", value)
    }
    
    // 方式2：检查第二个返回值
    ch2 := make(chan string, 1)
    ch2 <- "hello"
    close(ch2)
    
    if value, ok := <-ch2; ok {
        fmt.Println("Received:", value)
    } else {
        fmt.Println("Channel is closed")
    }
    
    // 再次尝试接收
    if value, ok := <-ch2; ok {
        fmt.Println("Received:", value)
    } else {
        fmt.Println("Channel is closed, no more values")
    }
}

func main() {
    demonstrateChannelClose()
    checkChannelClose()
}
```

### Channel多路复用

```go
import (
    "fmt"
    "time"
)

func producer(name string, ch chan<- string, interval time.Duration) {
    for i := 1; i <= 3; i++ {
        ch <- fmt.Sprintf("%s-%d", name, i)
        time.Sleep(interval)
    }
    close(ch)
}

func main() {
    ch1 := make(chan string)
    ch2 := make(chan string)
    ch3 := make(chan string)
    
    // 启动多个生产者
    go producer("Fast", ch1, 500*time.Millisecond)
    go producer("Medium", ch2, 1*time.Second)
    go producer("Slow", ch3, 2*time.Second)
    
    // 多路复用接收
    for {
        select {
        case msg1, ok := <-ch1:
            if ok {
                fmt.Println("From ch1:", msg1)
            }
        case msg2, ok := <-ch2:
            if ok {
                fmt.Println("From ch2:", msg2)
            }
        case msg3, ok := <-ch3:
            if ok {
                fmt.Println("From ch3:", msg3)
            }
        case <-time.After(5 * time.Second):
            fmt.Println("Timeout, exiting")
            return
        }
        
        // 检查是否所有channel都已关闭
        if !isChannelOpen(ch1) && !isChannelOpen(ch2) && !isChannelOpen(ch3) {
            fmt.Println("All channels closed, exiting")
            return
        }
    }
}

func isChannelOpen(ch <-chan string) bool {
    select {
    case _, ok := <-ch:
        return ok
    default:
        return true
    }
}
```

### Channel模式（fan-in、fan-out）

```go
import (
    "fmt"
    "sync"
)

// Fan-out: 一个输入分发到多个处理者
func fanOut(input <-chan int, numWorkers int) []<-chan string {
    outputs := make([]<-chan string, numWorkers)
    
    for i := 0; i < numWorkers; i++ {
        output := make(chan string)
        outputs[i] = output
        
        go func(workerID int, out chan<- string) {
            defer close(out)
            for num := range input {
                result := fmt.Sprintf("Worker-%d processed %d", workerID, num*num)
                out <- result
            }
        }(i, output)
    }
    
    return outputs
}

// Fan-in: 多个输入合并到一个输出
func fanIn(inputs ...<-chan string) <-chan string {
    output := make(chan string)
    
    var wg sync.WaitGroup
    wg.Add(len(inputs))
    
    for _, input := range inputs {
        go func(in <-chan string) {
            defer wg.Done()
            for msg := range in {
                output <- msg
            }
        }(input)
    }
    
    go func() {
        wg.Wait()
        close(output)
    }()
    
    return output
}

func main() {
    // 创建输入数据
    input := make(chan int, 10)
    go func() {
        for i := 1; i <= 10; i++ {
            input <- i
        }
        close(input)
    }()
    
    // Fan-out
    outputs := fanOut(input, 3)
    
    // Fan-in
    merged := fanIn(outputs...)
    
    // 处理合并后的结果
    for result := range merged {
        fmt.Println(result)
    }
}
```

### Channel性能优化

```go
import (
    "fmt"
    "runtime"
    "sync"
    "time"
)

// 性能测试不同channel配置
func benchmarkChannels() {
    const numMessages = 1000000
    
    // 测试无缓冲channel
    start := time.Now()
    unbufferedTest(numMessages)
    unbufferedTime := time.Since(start)
    
    // 测试有缓冲channel
    start = time.Now()
    bufferedTest(numMessages)
    bufferedTime := time.Since(start)
    
    fmt.Printf("Unbuffered channel time: %v\n", unbufferedTime)
    fmt.Printf("Buffered channel time: %v\n", bufferedTime)
}

func unbufferedTest(numMessages int) {
    ch := make(chan int)
    var wg sync.WaitGroup
    
    wg.Add(2)
    
    // 发送者
    go func() {
        defer wg.Done()
        for i := 0; i < numMessages; i++ {
            ch <- i
        }
        close(ch)
    }()
    
    // 接收者
    go func() {
        defer wg.Done()
        for range ch {
            // 处理消息
        }
    }()
    
    wg.Wait()
}

func bufferedTest(numMessages int) {
    // 缓冲区大小为CPU核心数的倍数
    bufferSize := runtime.NumCPU() * 100
    ch := make(chan int, bufferSize)
    var wg sync.WaitGroup
    
    wg.Add(2)
    
    // 发送者
    go func() {
        defer wg.Done()
        for i := 0; i < numMessages; i++ {
            ch <- i
        }
        close(ch)
    }()
    
    // 接收者
    go func() {
        defer wg.Done()
        for range ch {
            // 处理消息
        }
    }()
    
    wg.Wait()
}

// 对象池优化channel传输
type Message struct {
    ID      int
    Content string
    Data    []byte
}

var messagePool = sync.Pool{
    New: func() interface{} {
        return &Message{
            Data: make([]byte, 1024), // 预分配内存
        }
    },
}

func producerWithPool(ch chan<- *Message, count int) {
    for i := 0; i < count; i++ {
        msg := messagePool.Get().(*Message)
        msg.ID = i
        msg.Content = fmt.Sprintf("Message %d", i)
        ch <- msg
    }
    close(ch)
}

func consumerWithPool(ch <-chan *Message) {
    for msg := range ch {
        // 处理消息
        _ = len(msg.Content)
        
        // 归还对象到池
        messagePool.Put(msg)
    }
}

func main() {
    benchmarkChannels()
    
    // 对象池示例
    ch := make(chan *Message, 100)
    go producerWithPool(ch, 1000)
    consumerWithPool(ch)
}
```