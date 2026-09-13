---
'weapp-tailwindcss': patch
---

修复 Tailwind CSS v4 CSS 恢复与清理时误删用户自定义变量的问题，并改进 Taro issue-998 配置的跨平台路径检测。生成主题变量会被精确清理，用户变量和框架 CSS 规则保持原有顺序与覆盖关系。
