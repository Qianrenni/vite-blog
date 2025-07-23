## **2. 修改表：`ALTER TABLE`**

`ALTER TABLE`语句用于修改现有表的结构。它可以用来添加新列、修改现有列或删除列。

**常见操作：**

1. **添加列：**

   ```sql
   ALTER TABLE table_name ADD COLUMN column_name datatype;
   ```

   **示例：**

   ```sql
   ALTER TABLE Employees ADD COLUMN Email VARCHAR(100);
   ```

2. **修改列：**

   ```sql
   ALTER TABLE table_name MODIFY COLUMN column_name new_datatype;
   ```

   **示例：**

   ```sql
   ALTER TABLE Employees MODIFY COLUMN Salary DECIMAL(12, 2);
   ```

3. **删除列：**

   ```sql
   ALTER TABLE table_name DROP COLUMN column_name;
   ```

   **示例：**

   ```sql
   ALTER TABLE Employees DROP COLUMN Email;
   ```

---