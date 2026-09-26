---
"weapp-tailwindcss": patch
---

修复多 CSS 入口 watch 中当前生成结果被旧样式缓存重复回放的问题；显式 `source(none)` 多入口按空范围隔离；并在每轮构建重新注册文件型 @source 监听，避免切换来源或连续增删候选后旧类重新出现，使增量产物与干净构建保持一致。Refs #1241
