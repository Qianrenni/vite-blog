## **9.3 触发器（Trigger）**

**触发器**是一种特殊的存储过程，它在某些特定事件（如插入、更新或删除）发生时自动执行。触发器常用于实现复杂的业务规则或审计功能。

### **1. 创建触发器**

**语法：**

```sql
CREATE TRIGGER trigger_name
BEFORE/AFTER INSERT/UPDATE/DELETE ON table_name
FOR EACH ROW
BEGIN
    -- SQL statements
END;
```

**示例：**
创建一个触发器，在插入新员工时自动记录日志：

```sql
CREATE TRIGGER log_employee_insert
AFTER INSERT ON employees
FOR EACH ROW
BEGIN
    INSERT INTO logs (action, employee_id, action_time)
    VALUES ('INSERT', NEW.employee_id, NOW());
END;
```

### **2. 触发器的优点**

- **自动化处理**：无需手动调用，触发器会自动响应事件。
- **数据完整性**：确保数据符合业务规则。
- **审计功能**：记录数据变更的历史。

---