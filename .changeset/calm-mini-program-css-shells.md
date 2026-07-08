---
"weapp-tailwindcss": patch
---

修复 Vite 小程序 watch HMR 在回放 `app.wxss`/`main.wxss` 等样式输出壳时，可能把输出文件自引用 `@import` 再次交给 Tailwind 解析的问题，避免增量编译时报 `Can't resolve 'app.wxss'`。

同时在 generateBundle 回放已有同名 CSS asset 时复用当前 bundle 产物，避免 `main.wxss` 等小程序样式文件重复发射警告。
