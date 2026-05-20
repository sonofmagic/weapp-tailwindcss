---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v3 自定义生成引擎在显式候选驱动的增量生成中重复扫描配置 content 的问题，避免 uni-app Vite 热更新时生成 CSS 持续膨胀并拖慢 HMR。
