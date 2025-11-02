---
"@weapp-tailwindcss/merge": minor
"weapp-tailwindcss": minor
---

重构 `@weapp-tailwindcss/merge` 的安装后脚本，自动识别 Tailwind CSS 版本、支持环境变量强制切换并提供安全的回退流程。同时将 `postinstall` 作为构建入口确保脚本始终打包输出。默认配置包移除对 `twMerge` 等辅助函数的自动忽略，交由用户按需配置。
