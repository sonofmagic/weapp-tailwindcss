---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v3 生成器在插件 class cache 中过滤通配符候选时的兼容问题，补充 v3/v4 生成器对官方插件、自定义插件和 Iconify 图标插件的回归覆盖，并在 Tailwind CSS v4 小程序生成输出中将 OKLCH/OKLAB 颜色降级为小程序可识别的 RGB/RGBA。
