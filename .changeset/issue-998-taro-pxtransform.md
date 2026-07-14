---
"weapp-tailwindcss": patch
---

修复 Taro Tailwind CSS v4 生成样式未继承框架 pxtransform 配置的问题，确保 CSS 变量中的 px 按 designWidth 和 deviceRatio 正确转换为 rpx。
