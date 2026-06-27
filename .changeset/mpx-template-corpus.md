---
"weapp-tailwindcss": patch
---

修复 Mpx `wx` 构建下 Tailwind CSS v4 条件 custom variant 的平台识别，确保 `#ifdef MP-WEIXIN` 分支生成微信端样式，并补充 uni-app、Taro、Mpx、uni-app x 的模板 Tailwind 写法回归覆盖。
