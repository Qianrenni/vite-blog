## **1. 创建表：`CREATE TABLE`**

`CREATE TABLE`语句用于在数据库中创建一个新表。它定义了表的结构，包括列名、数据类型以及约束条件。

**语法：**

```sql
CREATE TABLE table_name (
    column1 datatype [constraint],
    column2 datatype [constraint],
    ...
);
```

- **column1, column2**: 表中的列名。
- **datatype**: 每个列的数据类型（如`INT`, `VARCHAR(n)`, `DATE`等）。
- **constraint**: 列的约束条件（可选），例如主键（`PRIMARY KEY`）、非空（`NOT NULL`）、唯一（`UNIQUE`）等。

**示例：**

```sql
CREATE TABLE Employees (
    EmployeeID INT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    BirthDate DATE,
    Salary DECIMAL(10, 2)
);
```

上述语句创建了一个名为`Employees`的表，包含员工的基本信息，并设置了主键和非空约束。

---