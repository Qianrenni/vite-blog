# 🔥 三、缓存雪崩（Cache Avalanche）

## 📌 定义：
大量 key 同时过期或 Redis 故障宕机，导致所有请求都转发到数据库，形成瞬间高并发，压垮数据库。

## 🧨 危害：
数据库承受不了如此大的并发压力，可能会引发服务不可用。

## ✅ 解决方案：

1. **缓存失效时间加随机值**
   - 给每个 key 的过期时间加上一个随机数，避免同一时间大量 key 失效。

2. **集群部署 + 高可用**
   - 使用 Redis Cluster 或哨兵机制，提高 Redis 的可用性，避免单点故障。

3. **降级熔断机制**
   - 当 Redis 不可用时，启用本地缓存或限流策略，保护数据库。

4. **多级缓存架构**
   - 使用本地缓存作为第一层，Redis 作为第二层，降低 Redis 崩溃带来的影响。

---