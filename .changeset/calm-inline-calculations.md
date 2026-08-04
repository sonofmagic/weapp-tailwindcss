---
'@weapp-tailwindcss/postcss': patch
'weapp-tailwindcss': patch
---

修复逻辑方向属性展开后残留 `calc()` 声明导致小程序间距计算异常的问题，并避免清理过程改变作者声明的级联与 `!important` 语义。
