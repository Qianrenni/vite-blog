## **1. Lambda 表达式**

Lambda 表达式是一种匿名函数，允许我们以简洁的方式定义内联函数对象，常用于 STL 算法中。

### **1.1 Lambda 的定义与捕获列表**
- **语法**：
  ```cpp
  [捕获列表](参数列表) -> 返回类型 {
      函数体
  }
  ```
  - **捕获列表**：指定 Lambda 表达式如何访问外部变量。
    - `[=]`：按值捕获所有外部变量。
    - `[&]`：按引用捕获所有外部变量。
    - `[x, &y]`：按值捕获 `x`，按引用捕获 `y`。
  - **参数列表**：类似于普通函数的参数列表。
  - **返回类型**：可以省略，编译器会自动推导。

**示例**：
```cpp
#include <iostream>
using namespace std;

int main() {
    int x = 10, y = 20;

    // 按值捕获 x 和 y
    auto lambda = [x, y]() { return x + y; };
    cout << "Sum: " << lambda() << endl; // 输出：30

    // 按引用捕获 y
    auto lambdaRef = [&y](int a) { y += a; };
    lambdaRef(5);
    cout << "New y: " << y << endl; // 输出：25
}
```

### **1.2 Lambda 在 STL 中的应用**
Lambda 表达式广泛应用于 STL 算法中，例如 `std::for_each`, `std::sort` 等。

**示例**：
以下是一个使用 Lambda 表达式的例子，对 `vector` 进行排序和遍历：
```cpp
#include <vector>
#include <algorithm>
#include <iostream>
using namespace std;

int main() {
    vector<int> v = {5, 2, 8, 1, 9};

    // 使用 Lambda 表达式进行排序
    sort(v.begin(), v.end(), [](int a, int b) { return a > b; }); // 降序排序
    for (int x : v) cout << x << " "; // 输出：9 8 5 2 1
    cout << endl;

    // 使用 Lambda 表达式遍历
    for_each(v.begin(), v.end(), [](int x) { cout << x * 2 << " "; }); // 输出每个元素的两倍
    cout << endl;
}
```

---