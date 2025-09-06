## **2. 分治法（Divide & Conquer）**

- **模板**：
  1. 分解问题
  2. 解决子问题
  3. 合并结果
- **应用**：归并排序、快速排序、Strassen矩阵乘法,斐波拉契数列,跳点问题
- **举例**:

  ```python
  def Fibonacci(n):
      if n <= 1:  # 边界条件
        return 1
      return Fibonacci(n-1) + Fibonacci(n-2)
  ```