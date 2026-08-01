---
"weapp-tailwindcss": patch
---

修复 Taro Vite 监听模式连续构建时根样式 replay 丢失的问题，保留框架生成的全局样式并恢复 native watch 回归验证。
