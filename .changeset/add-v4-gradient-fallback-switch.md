---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

新增 `tailwindcssV4GradientFallback` 配置项，用于控制 Tailwind CSS v4 渐变工具类是否额外生成小程序可直接解析的字面量兜底规则。

默认仍保持开启，以确保微信小程序中 `via-*`、变量 stop、radial、conic 等渐变组合能稳定渲染；如目标运行时已经完整支持 Tailwind CSS v4 的变量渐变写法，可显式设置为 `false` 保留变量输出。
