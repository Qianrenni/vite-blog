## **分页查询（LIMIT/OFFSET）**

当处理大量数据时，一次性返回所有记录既不现实也不高效。分页查询允许按需加载部分数据。

- **基本语法**:
  使用 `LIMIT` 和 `OFFSET` 来实现分页。

  ```sql
  SELECT * FROM products ORDER BY id LIMIT 10 OFFSET 20;
  ```

  这个例子从第21条记录开始，返回接下来的10条记录。

- **优化建议**:
  - **索引优化**: 确保用于排序的列上有索引，以加速分页查询。
  - **避免深度分页**: 当 `OFFSET` 很大时，性能会显著下降。一种替代方案是使用键集分页（Keyset Pagination），基于最后一个项目的ID来过滤下一页的数据。

    ```sql
    SELECT * FROM products WHERE id > last_seen_id ORDER BY id LIMIT 10;
    ```

---