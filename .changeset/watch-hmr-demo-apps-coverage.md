---
"weapp-tailwindcss": patch
---

修复 Vite watch 场景下生成器候选类刷新不完整的问题，确保脚本中新增的原子类能同步生成到小程序样式产物。

补齐 demo 与 apps 的 watch/HMR 端到端覆盖，在模板、脚本与样式变更后同时校验小程序模板、JS 与 WXSS 产物中的转义结果。
