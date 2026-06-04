---
"weapp-tailwindcss": patch
---

Tailwind CSS v4 初始源码扫描生成完成后会同步预热增量生成缓存，避免第一次热更新因为没有基线缓存而再次触发完整 v4 生成。
