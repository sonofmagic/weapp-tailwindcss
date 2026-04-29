---
"weapp-tailwindcss": patch
---

统一 CLI 与 `doctor` 诊断命令的 Node.js 版本判断，按文档和包声明使用 `^20.19.0 || >=22.12.0` 范围，避免较低的 Node.js 22 版本被误判为可用。
