---
"weapp-tailwindcss": patch
---

修复开启 `unocss` 兼容后，`text-var(--brand)`、`w-calc(100%-1rem)`、`bg-#fff` 等 UnoCSS 风格裸任意值在 Tailwind CSS v3 / v4 生成链路中没有稳定进入候选或输出选择器无法和原始 class 对齐的问题。
