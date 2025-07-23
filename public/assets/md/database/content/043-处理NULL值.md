## **处理NULL值**

在数据库中，`NULL` 表示缺少值或未知值。正确处理 `NULL` 值是避免逻辑错误和意外行为的关键。

- **检查NULL值**:
  使用 `IS NULL` 或 `IS NOT NULL` 来判断列是否为 `NULL`。

  ```sql
  SELECT * FROM employees WHERE department IS NULL;
  ```

- **聚合函数处理NULL值**:
  大多数聚合函数（如 `SUM()`、`AVG()`）忽略 `NULL` 值。如果需要考虑 `NULL` 值，可以在计算前将其转换为默认值。

  ```sql
  SELECT AVG(COALESCE(salary, 0)) FROM employees;
  ```

  这里使用 `COALESCE()` 函数将 `salary` 列中的 `NULL` 值替换为 `0`。

- **连接时处理NULL值**:
  在JOIN操作中，`NULL` 值可能影响结果集。例如，在左外连接中，右表中没有匹配的行将导致结果集中对应列为 `NULL`。

---