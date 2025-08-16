## 5.1 Goroutine

### Goroutine概念

```go
// Goroutine是Go语言中的轻量级线程
// 由Go运行时管理，比操作系统线程更轻量
// 可以轻松创建成千上万个Goroutine

import (
    "fmt"
    "runtime"
    "time"
)

func main() {
    // 查看当前Goroutine数量
    fmt.Println("Initial goroutines:", runtime.NumGoroutine())
    
    // 启动一个Goroutine
    go func() {
        fmt.Println("Hello from goroutine")
    }()
    
    // 主Goroutine休眠，让其他Goroutine有机会执行
    time.Sleep(time.Second)
    fmt.Println("Final goroutines:", runtime.NumGoroutine())
}
```

### 创建和管理Goroutine

```go
import (
    "fmt"
    "sync"
    "time"
)

func worker(id int, wg *sync.WaitGroup) {
    defer wg.Done()
    fmt.Printf("Worker %d starting\n", id)
    time.Sleep(time.Second)
    fmt.Printf("Worker %d done\n", id)
}

func main() {
    var wg sync.WaitGroup
    
    // 创建多个Goroutine
    for i := 1; i <= 5; i++ {
        wg.Add(1)
        go worker(i, &wg)
    }
    
    // 等待所有Goroutine完成
    wg.Wait()
    fmt.Println("All workers completed")
}

// 带参数的Goroutine
func processItem(item string, ch chan string) {
    result := fmt.Sprintf("Processed: %s", item)
    ch <- result
}

func mainWithChannels() {
    items := []string{"item1", "item2", "item3"}
    ch := make(chan string, len(items))
    
    // 启动多个Goroutine处理数据
    for _, item := range items {
        go processItem(item, ch)
    }
    
    // 收集结果
    for i := 0; i < len(items); i++ {
        result := <-ch
        fmt.Println(result)
    }
}
```

### Goroutine调度机制

```go
import (
    "fmt"
    "runtime"
    "sync"
    "time"
)

func demonstrateScheduler() {
    // 设置最大并发数
    runtime.GOMAXPROCS(2)
    fmt.Printf("Number of CPUs: %d\n", runtime.NumCPU())
    fmt.Printf("Max procs: %d\n", runtime.GOMAXPROCS(0))
    
    var wg sync.WaitGroup
    wg.Add(10)
    
    // 创建多个CPU密集型Goroutine
    for i := 0; i < 10; i++ {
        go func(id int) {
            defer wg.Done()
            // 模拟CPU密集型工作
            start := time.Now()
            count := 0
            for time.Since(start) < time.Millisecond*100 {
                count++
            }
            fmt.Printf("Goroutine %d finished after %v\n", id, time.Since(start))
        }(i)
    }
    
    wg.Wait()
}

// 协作式调度示例
func cooperativeScheduling() {
    for i := 0; i < 3; i++ {
        go func(id int) {
            for {
                fmt.Printf("Goroutine %d is working\n", id)
                // 主动让出CPU时间片
                runtime.Gosched()
                time.Sleep(100 * time.Millisecond)
            }
        }(i)
    }
    
    time.Sleep(2 * time.Second)
}
```

### Goroutine生命周期

```go
import (
    "context"
    "fmt"
    "time"
)

// 使用context管理Goroutine生命周期
func workerWithContext(ctx context.Context, id int, result chan<- string) {
    for {
        select {
        case <-ctx.Done():
            result <- fmt.Sprintf("Worker %d stopped: %v", id, ctx.Err())
            return
        case <-time.After(time.Second):
            result <- fmt.Sprintf("Worker %d is working", id)
        }
    }
}

func main() {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    
    result := make(chan string, 10)
    
    // 启动工作Goroutine
    for i := 1; i <= 3; i++ {
        go workerWithContext(ctx, i, result)
    }
    
    // 收集结果直到超时
    for {
        select {
        case msg := <-result:
            fmt.Println(msg)
        case <-ctx.Done():
            fmt.Println("Main context done")
            return
        }
    }
}
```

### Goroutine池化

```go
import (
    "fmt"
    "sync"
)

type WorkerPool struct {
    workerCount int
    jobQueue    chan Job
    wg          sync.WaitGroup
}

type Job struct {
    ID       int
    Data     interface{}
    Process  func(interface{}) interface{}
}

func NewWorkerPool(workerCount int) *WorkerPool {
    return &WorkerPool{
        workerCount: workerCount,
        jobQueue:    make(chan Job, 100),
    }
}

func (wp *WorkerPool) Start() {
    for i := 0; i < wp.workerCount; i++ {
        wp.wg.Add(1)
        go wp.worker(i)
    }
}

func (wp *WorkerPool) worker(id int) {
    defer wp.wg.Done()
    for job := range wp.jobQueue {
        fmt.Printf("Worker %d processing job %d\n", id, job.ID)
        result := job.Process(job.Data)
        fmt.Printf("Worker %d finished job %d with result: %v\n", id, job.ID, result)
    }
}

func (wp *WorkerPool) Submit(job Job) {
    wp.jobQueue <- job
}

func (wp *WorkerPool) Stop() {
    close(wp.jobQueue)
    wp.wg.Wait()
}

func main() {
    pool := NewWorkerPool(3)
    pool.Start()
    
    // 提交任务
    for i := 1; i <= 10; i++ {
        job := Job{
            ID:   i,
            Data: i,
            Process: func(data interface{}) interface{} {
                num := data.(int)
                return num * num
            },
        }
        pool.Submit(job)
    }
    
    pool.Stop()
    fmt.Println("All jobs completed")
}
```

### Goroutine泄漏检测

```go
import (
    "context"
    "fmt"
    "runtime"
    "time"
)

// 检测Goroutine泄漏的工具函数
func countGoroutines() int {
    return runtime.NumGoroutine()
}

// 造成Goroutine泄漏的例子
func leakyFunction() {
    go func() {
        for {
            // 无限循环，永远不会退出
            time.Sleep(time.Second)
        }
    }()
}

// 正确的Goroutine管理
func properFunction(ctx context.Context) {
    go func() {
        for {
            select {
            case <-ctx.Done():
                fmt.Println("Goroutine properly stopped")
                return
            case <-time.After(time.Second):
                fmt.Println("Working...")
            }
        }
    }()
}

func demonstrateLeakDetection() {
    initialCount := countGoroutines()
    fmt.Printf("Initial goroutines: %d\n", initialCount)
    
    // 泄漏的Goroutine
    leakyFunction()
    time.Sleep(100 * time.Millisecond)
    fmt.Printf("After leaky function: %d\n", countGoroutines())
    
    // 正确管理的Goroutine
    ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
    defer cancel()
    properFunction(ctx)
    
    time.Sleep(100 * time.Millisecond)
    fmt.Printf("After proper function: %d\n", countGoroutines())
    
    // 等待context超时
    <-ctx.Done()
    time.Sleep(100 * time.Millisecond)
    fmt.Printf("After context timeout: %d\n", countGoroutines())
}
```

### Goroutine上下文传递

```go
import (
    "context"
    "fmt"
    "time"
)

type Config struct {
    Timeout time.Duration
    UserID  string
    TraceID string
}

func processWithContext(ctx context.Context, config Config) error {
    // 从context中获取值
    if userID := ctx.Value("userID"); userID != nil {
        fmt.Printf("Processing for user: %v\n", userID)
    }
    
    // 设置超时
    ctx, cancel := context.WithTimeout(ctx, config.Timeout)
    defer cancel()
    
    // 模拟处理过程
    select {
    case <-time.After(2 * time.Second):
        fmt.Println("Processing completed")
        return nil
    case <-ctx.Done():
        fmt.Printf("Processing cancelled: %v\n", ctx.Err())
        return ctx.Err()
    }
}

func main() {
    // 创建带有值的context
    ctx := context.Background()
    ctx = context.WithValue(ctx, "userID", "user123")
    ctx = context.WithValue(ctx, "traceID", "trace456")
    
    config := Config{
        Timeout: 3 * time.Second,
        UserID:  "user123",
        TraceID: "trace456",
    }
    
    err := processWithContext(ctx, config)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
    }
}
```