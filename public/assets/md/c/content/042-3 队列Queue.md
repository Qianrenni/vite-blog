## **3. 队列（Queue）**

队列是一种先进先出（FIFO）的数据结构，支持两种主要操作：`enqueue`（入队）和 `dequeue`（出队）。

### **3.1 数组实现**

- **定义**：

  ```c
  #define MAX_SIZE 100

  struct Queue {
      int data[MAX_SIZE];
      int front;
      int rear;
  };
  ```

- **实现**：

  ```c
  #include <stdio.h>
  #include <stdlib.h>

  struct Queue {
      int data[MAX_SIZE];
      int front;
      int rear;
  };

  void initQueue(struct Queue *queue) {
      queue->front = -1;
      queue->rear = -1;
  }

  int isFull(struct Queue *queue) {
      return queue->rear == MAX_SIZE - 1;
  }

  int isEmpty(struct Queue *queue) {
      return queue->front == -1;
  }

  void enqueue(struct Queue *queue, int value) {
      if (isFull(queue)) {
          printf("Queue Overflow\n");
          return;
      }
      if (isEmpty(queue)) {
          queue->front = 0;
      }
      queue->data[++(queue->rear)] = value;
  }

  int dequeue(struct Queue *queue) {
      if (isEmpty(queue)) {
          printf("Queue Underflow\n");
          return -1;
      }
      int value = queue->data[queue->front];
      if (queue->front == queue->rear) {
          queue->front = queue->rear = -1;
      } else {
          queue->front++;
      }
      return value;
  }

  int main() {
      struct Queue queue;
      initQueue(&queue);

      enqueue(&queue, 10);
      enqueue(&queue, 20);
      enqueue(&queue, 30);

      printf("Dequeued: %d\n", dequeue(&queue));  // 输出：10
      printf("Dequeued: %d\n", dequeue(&queue));  // 输出：20

      return 0;
  }
  ```

---