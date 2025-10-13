---
"weapp-tailwindcss": patch
---

优化 `replaceHandleValue` 的热路径，跳过无效拆分、复用正则与转义缓存，并在混淆流程中避免重复处理；同时改进 Unicode 解码与名称匹配工具的性能并补充单测验证。
