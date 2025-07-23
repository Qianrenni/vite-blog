## **2. 查询执行计划（EXPLAIN）**

**EXPLAIN** 是一种工具，用于显示查询语句的执行计划，帮助理解查询是如何执行的，并找出潜在的性能瓶颈。

- **如何使用 EXPLAIN**:
  在查询语句前加上 `EXPLAIN` 关键字，即可查看该查询的执行计划。

```sql
EXPLAIN SELECT * FROM employees WHERE department = 'Sales';
```

- **关键信息解读**:
  - **type**: 表示连接类型，理想的顺序是从 system 到 const, eq_ref, ref, range, index, ALL。
  - **key**: 使用的索引名称。
  - **rows**: 预估需要检查的行数，数值越小越好。
  - **Extra**: 包含其他有用的信息，如是否使用了文件排序、临时表等。

---