---
"weapp-tailwindcss": patch
---

修复 `uni-app-vite` 自动推断后错误缩窄 `cssPreflight` 和 `cssSelectorReplacement.root` 的问题，恢复小程序端默认的 `view,text,::after,::before` 与 `:host,page,.tw-root,wx-root-portal-content` 选择器输出，并补充回归测试。
