---
"weapp-tailwindcss": patch
---

修复 Taro 构建重复实例化 UnifiedWebpackPluginV5 时会创建多份 Tailwind 运行时的问题：
新增编译上下文缓存、复用 tailwindcss patcher，并保证相同配置只初始化一次以降低内存占用。
