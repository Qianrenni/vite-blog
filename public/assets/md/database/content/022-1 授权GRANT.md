## **1. 授权（GRANT）**

`GRANT` 语句用于向用户或角色授予对数据库对象（如表、视图、存储过程等）的特定权限。通过授权，用户可以获得执行某些操作的能力，例如查询数据、插入记录、修改数据等。

**语法：**

```sql
GRANT privilege ON object TO user;
```

- **privilege（权限）**:
  指定要授予的具体权限。常见的权限包括：
  - `SELECT`: 允许用户查询数据。
  - `INSERT`: 允许用户插入新记录。
  - `UPDATE`: 允许用户更新现有记录。
  - `DELETE`: 允许用户删除记录。
  - `ALL PRIVILEGES`: 授予所有权限。

- **object（对象）**:
  指定权限作用的目标数据库对象，例如表、视图等。格式通常是 `database_name.table_name` 或 `schema_name.object_name`。

- **user（用户）**:
  指定接收权限的用户或角色。

**示例：**

1. 授予用户 `alice` 对表 `employees` 的查询权限：

   ```sql
   GRANT SELECT ON employees TO alice;
   ```

2. 授予用户 `bob` 对数据库 `company` 中的所有表的操作权限：

   ```sql
   GRANT ALL PRIVILEGES ON company.* TO bob;
   ```

3. 授予用户 `manager` 对表 `sales` 的插入和更新权限：

   ```sql
   GRANT INSERT, UPDATE ON sales TO manager;
   ```

**注意：**

- 权限可以逐级传递。如果在 `GRANT` 命令中添加 `WITH GRANT OPTION`，则被授权的用户还可以将这些权限授予其他用户。
- 授权后，通常需要刷新权限缓存以使更改生效（例如使用 `FLUSH PRIVILEGES;`）。

---