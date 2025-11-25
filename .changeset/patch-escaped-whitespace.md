---
'@weapp-tailwindcss/shared': patch
weapp-tailwindcss: patch
---

修复 splitCode 在压缩模板字符串中保留转义空白导致类名匹配遗漏的问题，保证 mp-alipay 等产物的类名替换正常工作。
