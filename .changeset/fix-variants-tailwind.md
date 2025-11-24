---
'@weapp-tailwindcss/variants': patch
---

修复 tailwind-variants 升级后内部 chunk 入口失效的问题，改用官方导出的 tv/createTV/cx，并确保 cn/cnBase 继续执行小程序转义与合并逻辑。
