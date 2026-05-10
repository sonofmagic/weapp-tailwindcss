---
"weapp-tailwindcss": minor
---

新增 `arbitraryValues.bareArbitraryValues` 配置，默认关闭。开启后会把 UnoCSS 风格裸任意值识别交给 `tailwindcss-patch` v4 引擎处理，例如 `p-10%`、`p-2.5px`、`m-4rem`，小程序侧继续按生成出的 `classNameSet` 精确转义。

升级 `tailwindcss-patch` 到 `9.3.0`。
