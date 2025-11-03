---
"weapp-tailwindcss": patch
---

收紧 JS 标记模板的忽略范围：默认仅认得 `weappTwIgnore` 及其导入别名，普通 `String.raw` 别名会继续转译。顺便把 `eval`、模块替换等逻辑拆分到独立模块，后续维护更清晰。
