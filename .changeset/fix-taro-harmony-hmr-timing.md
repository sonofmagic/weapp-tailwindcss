---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

修复 `:where(.dark, .dark *)` 等多分支选择器展开后丢失通配符后代分支的问题，确保小程序端会生成对应的 `view` / `text` 后代选择器。

修复 Taro demo 的 `dev:harmony` 脚本未显式开启 HMR timing 输出的问题，确保 Harmony 别名脚本与实际 watch 脚本行为一致。
