---
"weapp-tailwindcss": patch
---

拆分运行时 Loader，新增仅 TailwindCSS v4 会启用的 CSS import 重写 Loader，并将 classSet 采集逻辑放入独立 Loader，便于在正确的 loader 顺序中执行。
