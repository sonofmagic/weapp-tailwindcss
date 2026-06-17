---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

调整 Tailwind CSS v4 渐变工具类的小程序兼容策略，默认保留 `--tw-gradient-*` CSS 变量链路，覆盖 `background-image` 文档中的 linear、radial、conic、任意值、自定义属性、stop 颜色与位置等组合。

`tailwindcssV4GradientFallback` 现在改为显式设置 `true` 时才追加旧版字面量组合兜底，避免默认产物膨胀并让 v4 渐变行为更接近 Tailwind 官方输出。
