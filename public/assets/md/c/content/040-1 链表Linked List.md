## **1. 链表（Linked List）**

链表是一种线性数据结构，由一系列节点组成，每个节点包含数据和指向下一个节点的指针。

### **1.1 单向链表**

- **特点**：
  - 每个节点包含两个部分：数据部分和指向下一个节点的指针。
  - 最后一个节点的指针为 `NULL`，表示链表结束。

- **定义**：

  ```c
  struct Node {
      int data;
      struct Node *next;
  };
  ```

- **实现**：

  ```c
  #include <stdio.h>
  #include <stdlib.h>

  // 定义链表节点
  struct Node {
      int data;
      struct Node *next;
  };

  // 插入节点到链表头部
  void insert(struct Node **head, int value) {
      struct Node *newNode = (struct Node *)malloc(sizeof(struct Node));
      newNode->data = value;
      newNode->next = *head;
      *head = newNode;
  }

  // 打印链表
  void printList(struct Node *head) {
      struct Node *current = head;
      while (current != NULL) {
          printf("%d -> ", current->data);
          current = current->next;
      }
      printf("NULL\n");
  }

  // 释放链表内存
  void freeList(struct Node *head) {
      struct Node *tmp;
      while (head != NULL) {
          tmp = head;
          head = head->next;
          free(tmp);
      }
  }

  int main() {
      struct Node *head = NULL;

      insert(&head, 10);
      insert(&head, 20);
      insert(&head, 30);

      printList(head);  // 输出：30 -> 20 -> 10 -> NULL

      freeList(head);
      return 0;
  }
  ```

---

### **1.2 双向链表**

- **特点**：
  - 每个节点包含三个部分：数据部分、指向前一个节点的指针和指向下一个节点的指针。

- **定义**：

  ```c
  struct Node {
      int data;
      struct Node *prev;
      struct Node *next;
  };
  ```

---