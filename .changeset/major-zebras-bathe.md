---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

移除带有 `@supports` `color-mix` 的 css 节点, 修复 

- [#632](https://github.com/sonofmagic/weapp-tailwindcss/issues/632) 
- [#631](https://github.com/sonofmagic/weapp-tailwindcss/issues/631)


> 但是这种行为会导致使用透明度 + css 变量的时候，被回滚到固定的颜色值，因为微信小程序不支持 `color-mix`，同时 `tailwindcss` 依赖 `color-mix` + `css var` 来进行颜色变量的计算。