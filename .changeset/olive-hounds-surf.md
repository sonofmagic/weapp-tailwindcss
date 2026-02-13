---
"weapp-tailwindcss": patch
---

扩展 watch 热更新回归矩阵与分项目报告能力，补齐重点 demo/apps 的可观测性：

- 将热更新用例按项目维度拆分执行，覆盖 apps 与 demos 的独立链路，报告按项目分别输出。
- 新增并强制校验重点项目热更新报告覆盖：`demo/uni-app-vue3-vite`、`demo/uni-app-tailwindcss-v4`、`demo/taro-vite-tailwindcss-v4`、`demo/taro-app-vite`、`demo/taro-webpack-tailwindcss-v4`、`demo/taro-vue3-app`。
- 在模板文件（wxml/vue/tsx 等）与 JS/TS 变更热更新验证之外，增加全局样式 `app.wxss` 转译类同步检查，确保新增类在全局产物可追踪。
- 增强回归脚本稳定性与报告字段，补充按项目的热更新耗时与样式转译校验信息，便于横向对比与回归排查。
