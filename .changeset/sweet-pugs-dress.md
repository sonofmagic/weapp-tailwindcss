---
"weapp-tailwindcss": patch
---

统一 Web 与 Harmony 的相对样式引用路径解析，保留 Windows UNC 共享目录与盘符根边界，避免跨平台解析网络模块时丢失共享根目录。
