---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

修复 `cssCalc` 将局部主题和条件覆盖误当作全局常量的问题，保留变量来源、完整声明和输出上下文；冲突、未知变量及其依赖链继续使用运行时表达式。

统一多来源 eager/deferred 的静态化判断，修复 Map、正则配置和增量候选改变变量上下文后复用旧 CSS 的问题。`cssCalc` 不再隐式开启全局 CSS 变量展开，也不会删除未成功静态化的运行时声明。

补充真实 uni-app 微信构建与同进程 watch 回归。静态计算仍需显式启用，不改变微信自身的 `rpx` 换算算法。Refs #1214。
