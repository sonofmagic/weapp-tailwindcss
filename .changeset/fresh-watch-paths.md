---
"weapp-tailwindcss": patch
---

修复 webpack loader 在 Windows 下可能把 Tailwind 依赖目录注册为文件依赖的问题，避免 MPX 等 webpack watch 场景出现 invalid dependency 警告并导致热更新监听失效；同时补齐 e2e watch 失败时的预算报告输出。
