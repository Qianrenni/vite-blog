## **2. 栈（Stack）**

栈是一种后进先出（LIFO）的数据结构，支持两种主要操作：`push`（入栈）和 `pop`（出栈）。

### **2.1 数组实现**

- **定义**：

  ```c
  #define MAX_SIZE 100

  struct Stack {
      int data[MAX_SIZE];
      int top;
  };
  ```

- **实现**：

  ```c
  #include <stdio.h>
  #include <stdlib.h>

  struct Stack {
      int data[MAX_SIZE];
      int top;
  };

  void initStack(struct Stack *stack) {
      stack->top = -1;
  }

  int isFull(struct Stack *stack) {
      return stack->top == MAX_SIZE - 1;
  }

  int isEmpty(struct Stack *stack) {
      return stack->top == -1;
  }

  void push(struct Stack *stack, int value) {
      if (isFull(stack)) {
          printf("Stack Overflow\n");
          return;
      }
      stack->data[++(stack->top)] = value;
  }

  int pop(struct Stack *stack) {
      if (isEmpty(stack)) {
          printf("Stack Underflow\n");
          return -1;
      }
      return stack->data[(stack->top)--];
  }

  int main() {
      struct Stack stack;
      initStack(&stack);

      push(&stack, 10);
      push(&stack, 20);
      push(&stack, 30);

      printf("Popped: %d\n", pop(&stack));  // 输出：30
      printf("Popped: %d\n", pop(&stack));  // 输出：20

      return 0;
  }
  ```

---

### **2.2 链表实现**

- **定义**：

  ```c
  struct Node {
      int data;
      struct Node *next;
  };

  struct Stack {
      struct Node *top;
  };
  ```

---