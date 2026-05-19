---
"weapp-tailwindcss": patch
---

修复 Mpx + Tailwind CSS v4 子包 CSS 中相对 `@config` 路径在构建时被错误按项目根解析的问题，保持源码相对当前文件的写法可用。
