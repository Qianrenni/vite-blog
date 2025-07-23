## **4. 创建索引：`CREATE INDEX`**

`CREATE INDEX`语句用于在表中的一个或多个列上创建索引。索引可以加快查询速度，但会增加插入和更新操作的开销。

**语法：**

```sql
CREATE INDEX index_name ON table_name (column);
```

**示例：**

```sql
CREATE INDEX idx_lastname ON Employees (LastName);
```

如果需要创建唯一索引（确保列值的唯一性），可以使用`CREATE UNIQUE INDEX`：

```sql
CREATE UNIQUE INDEX idx_email ON Employees (Email);
```

---