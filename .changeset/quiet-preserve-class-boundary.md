---
"weapp-tailwindcss": patch
---

修复 `jsPreserveClass` 在 `alwaysEscape` 模式下不生效的问题，确保用户显式保留的业务或第三方 class 不会被 JS 转译改写。
