## **2. 撤销权限（REVOKE）**

`REVOKE` 语句用于撤销之前授予用户的权限。通过撤销权限，可以限制用户对数据库对象的操作，从而增强数据的安全性。

**语法：**

```sql
REVOKE privilege ON object FROM user;
```

- **privilege（权限）**:
  指定要撤销的权限。与 `GRANT` 类似，可以是单个权限或多个权限。

- **object（对象）**:
  指定权限作用的目标数据库对象。

- **user（用户）**:
  指定要撤销权限的用户或角色。

**示例：**

1. 撤销用户 `alice` 对表 `employees` 的查询权限：

   ```sql
   REVOKE SELECT ON employees FROM alice;
   ```

2. 撤销用户 `bob` 对数据库 `company` 中的所有权限：

   ```sql
   REVOKE ALL PRIVILEGES ON company.* FROM bob;
   ```

3. 撤销用户 `manager` 对表 `sales` 的更新权限：

   ```sql
   REVOKE UPDATE ON sales FROM manager;
   ```

**注意：**

- 如果某个用户通过 `WITH GRANT OPTION` 将权限授予了其他用户，则撤销该用户的权限时，不会自动撤销下游用户的权限。
- 撤销权限后，也需要刷新权限缓存以使更改生效。

---