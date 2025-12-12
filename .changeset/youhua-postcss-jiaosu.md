---
'@weapp-tailwindcss/postcss': patch
---

优化样式处理器缓存：以 WeakMap 和引用缓存替换字符串指纹查找，减少 options 合并和管线复用的热路径开销，并复用选择器解析配置以降低分配。基准显示 v3/v4 主块和 rpx 处理吞吐均有明显提升。
