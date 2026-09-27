---
"weapp-tailwindcss": patch
---

修复 core 显式编译快照的 JavaScript 转换：使用快照中的精确候选集合处理自定义 utility 和转义拼写，避免前缀预检漏转；保留协议相对 URL 及字符串中的换行语义，不再套用模板换行清理规则。
