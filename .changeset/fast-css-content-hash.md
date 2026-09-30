---
"@weapp-tailwindcss/postcss": patch
---

使用 32 位整数乘法减少样式缓存键的哈希开销，继续校验完整源码和配置，保持哈希碰撞、外部插件及 Root 来源的失效边界。
