---
"weapp-tailwindcss": patch
---

将 `@vue/compiler-dom` 与 `@vue/compiler-sfc` 调整为构建期依赖。uni-app x 转换所需的 Vue compiler 依赖会随 `weapp-tailwindcss` 产物内联，发布包不再要求使用者运行时额外安装这些 Vue compiler 包。
