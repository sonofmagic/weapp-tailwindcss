---
"weapp-tailwindcss": minor
---

重构缓存子系统与各 bundler 辅助逻辑：统一在缓存层处理哈希与写入流程，简化 `process` API，同时补充针对新行为的测试覆盖。
