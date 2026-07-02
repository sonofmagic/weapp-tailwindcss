---
"weapp-style-injector": patch
---

修复样式注入去重时 raw `@import` 与 `url()` 写法识别不一致的问题，避免等价导入被重复插入。
