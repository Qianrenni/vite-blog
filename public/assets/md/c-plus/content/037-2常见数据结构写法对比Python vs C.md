## 📌 2、常见数据结构写法对比（Python vs C++）

| 功能 | Python | C++ |
|------|--------|-----|
| 动态数组 | `list = []` | `vector<int> v;` |
| 字符串 | `s = "abc"` | `string s = "abc";` |
| 字典 | `d = {}` | `unordered_map<string, int> m;` |
| 集合 | `s = set()` | `unordered_set<int> st;` |
| 队列 | `from collections import deque` | `queue<int> q;` |
| 栈 | `stack = []` | `stack<int> st;` |
| 最大堆 | `heapq`（取负数模拟） | `priority_queue<int> pq;` |
| 最小堆 | `heapq` | `priority_queue<int, vector<int>, greater<>> pq;` |
| 双端队列 | `deque` | `deque<int> dq;` |
| 排序 | `sorted(list)` | `sort(vec.begin(), vec.end());` |
| 查找 | `in` 运算符 | `find(st.begin(), st.end(), x) != st.end()` |
| 拷贝子串 | `s[1:3]` | `s.substr(1, 2)` |

---