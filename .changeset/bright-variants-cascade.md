---
"weapp-tailwindcss": patch
---

修复 uni-app x H5 局部 Tailwind 工具类的级联优先级，确保 `dark` 等条件变体能够覆盖同一元素上的基础工具类。
