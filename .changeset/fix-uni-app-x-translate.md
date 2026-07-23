---
'@weapp-tailwindcss/postcss': patch
'weapp-tailwindcss': patch
---

修复 uni-app x 的 UVUE 样式目标无法识别 `translate()` 逗号分隔参数的问题，将顶层参数转换为空格分隔形式，并保留 `var()` 回退值等嵌套函数中的逗号。
