---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v3/v4 增量生成缓存只追加不删除的问题。当 HMR 中候选类集合减少时，生成器会完整重生成当前候选集合并刷新缓存，避免 Taro dev 回滚或删除 class 后旧 utilities 继续残留在 wxss 中。
