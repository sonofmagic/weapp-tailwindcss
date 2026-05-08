# v5 生成模式对 main(v4) 核心产物 diff 报告

## 目标

- 只比较当前分支 v5 生成模式与 main(v4) 的核心构建产物。
- 找出兼容风险点，并判断 v5 生成样式是否有更高质量的迹象或需要继续优化的方向。
- 每个项目均提供核心产物详细报告和 `artifact.diff`。

## 构建与比较口径

- baseline：`main` worktree `/private/tmp/weapp-tailwindcss-main-baseline`，commit `bf8a7d0468b077294a07e191b1ebb22f3666f830`。
- current：当前分支 `next`，commit `c18a8b677337136ca4c505239989893dae2a16fc`。
- 两边均先清理旧的 `dist/`、`build/`、`unpackage/` 和 `result.css`，再重新构建。
- current 构建命令：`TARO_BUILD_STRICT=1 UNI_BUILD_STRICT=1 WEAPP_TW_GENERATOR_MODE=generator pnpm -r --workspace-concurrency=1 --no-bail --filter=./apps/* --filter=./demo/* run build`。
- baseline 构建命令：`TARO_BUILD_STRICT=1 UNI_BUILD_STRICT=1 pnpm -r --workspace-concurrency=1 --no-bail --filter=./apps/* --filter=./demo/* run build`。
- 核心产物比较范围：`dist`、`result.css`、`unpackage`、`build`。本次实际命中 `dist` 与 `result.css`。
- 不比较项目源代码和配置文件；报告中不包含 `source.diff`。
- 产物 diff 口径：文本产物先格式化/规范化再比较，包括 CSS/WXSS、WXML/HTML、JSON/SourceMap、JS/WXS；大型规范化文本只记录内容 hash 和大小摘要，避免 bundle/巨型样式文件噪音。

## 总览

- 当前分支项目数：28
- main 项目数：25
- 公共项目：25
- 当前新增项目：3
- main 独有项目：0
- 公共项目规范化后核心产物完全一致：2
- 公共项目规范化后核心产物存在差异：19
- 公共项目无核心产物：4
- 公共项目规范化后逐文件差异：变更 105，新增 62，删除 61

## 优先级建议

- P0 兼容性优先：12 个项目涉及模板或脚本内容变化，应优先确认 class 转换、JS 转译和框架产物是否等价。
- P1 样式质量优先：7 个项目主要是 CSS/WXSS 内容变化，应重点比较规则覆盖、体积、重复规则和 reset/preflight 差异。
- P2 构建噪声：Web/Vite/MPX 项目中仍可能存在 hash 文件名、sourcemap 或组件 hash 目录变化，需要区分确定性构建差异与真实输出变化。

## 项目索引

| 项目 | 状态 | 兼容风险 | CSS 原始体积差 | 规范化产物差异 | 详细报告 | 产物 diff |
| --- | --- | --- | ---: | ---: | --- | --- |
| `apps/react-app` | 差异 | 中高风险 | 0 B | 3 | [report](apps/react-app/report.md) | [artifact.diff](apps/react-app/artifact.diff) |
| `apps/tailwindcss-weapp` | 差异 | 中高风险 | +776.0 KiB | 14 | [report](apps/tailwindcss-weapp/report.md) | [artifact.diff](apps/tailwindcss-weapp/artifact.diff) |
| `apps/taro-webpack-tailwindcss-v4` | 差异 | 中高风险 | -3.6 KiB | 5 | [report](apps/taro-webpack-tailwindcss-v4/report.md) | [artifact.diff](apps/taro-webpack-tailwindcss-v4/artifact.diff) |
| `apps/vite-native` | 差异 | 中风险 | +1.2 KiB | 1 | [report](apps/vite-native/report.md) | [artifact.diff](apps/vite-native/artifact.diff) |
| `apps/vite-native-skyline` | 差异 | 中风险 | -60 B | 1 | [report](apps/vite-native-skyline/report.md) | [artifact.diff](apps/vite-native-skyline/artifact.diff) |
| `apps/vite-native-ts` | 差异 | 中风险 | +11.8 KiB | 1 | [report](apps/vite-native-ts/report.md) | [artifact.diff](apps/vite-native-ts/artifact.diff) |
| `apps/vite-native-ts-skyline` | 差异 | 中高风险 | -19 B | 9 | [report](apps/vite-native-ts-skyline/report.md) | [artifact.diff](apps/vite-native-ts-skyline/artifact.diff) |
| `apps/vue-app` | 差异 | 中高风险 | 0 B | 3 | [report](apps/vue-app/report.md) | [artifact.diff](apps/vue-app/artifact.diff) |
| `apps/weapp-wechat-zhihu` | 一致 | 低风险 | 0 B | 0 | [report](apps/weapp-wechat-zhihu/report.md) | [artifact.diff](apps/weapp-wechat-zhihu/artifact.diff) |
| `apps/web-postcss7-compat` | 一致 | 低风险 | 0 B | 0 | [report](apps/web-postcss7-compat/report.md) | [artifact.diff](apps/web-postcss7-compat/artifact.diff) |
| `demo/gulp-app` | 差异 | 中风险 | -90 B | 1 | [report](demo/gulp-app/report.md) | [artifact.diff](demo/gulp-app/artifact.diff) |
| `demo/mpx-app` | 差异 | 中高风险 | +419 B | 114 | [report](demo/mpx-app/report.md) | [artifact.diff](demo/mpx-app/artifact.diff) |
| `demo/mpx-tailwindcss-v4` | 差异 | 中高风险 | +4.8 KiB | 23 | [report](demo/mpx-tailwindcss-v4/report.md) | [artifact.diff](demo/mpx-tailwindcss-v4/artifact.diff) |
| `demo/mpx-tailwindcss-v5` | 当前新增 | 新增项目 | +15.1 KiB | 26 | [report](demo/mpx-tailwindcss-v5/report.md) | [artifact.diff](demo/mpx-tailwindcss-v5/artifact.diff) |
| `demo/native` | 无产物 | 无产物 | 0 B | 0 | [report](demo/native/report.md) | [artifact.diff](demo/native/artifact.diff) |
| `demo/native-ts` | 差异 | 中风险 | -4.1 KiB | 1 | [report](demo/native-ts/report.md) | [artifact.diff](demo/native-ts/artifact.diff) |
| `demo/taro-app` | 差异 | 中高风险 | +4.0 KiB | 16 | [report](demo/taro-app/report.md) | [artifact.diff](demo/taro-app/artifact.diff) |
| `demo/taro-app-vite` | 差异 | 中风险 | +688 B | 1 | [report](demo/taro-app-vite/report.md) | [artifact.diff](demo/taro-app-vite/artifact.diff) |
| `demo/taro-vite-tailwindcss-v4` | 差异 | 中风险 | +3.7 KiB | 1 | [report](demo/taro-vite-tailwindcss-v4/report.md) | [artifact.diff](demo/taro-vite-tailwindcss-v4/artifact.diff) |
| `demo/taro-vite-tailwindcss-v5` | 当前新增 | 新增项目 | +26.3 KiB | 17 | [report](demo/taro-vite-tailwindcss-v5/report.md) | [artifact.diff](demo/taro-vite-tailwindcss-v5/artifact.diff) |
| `demo/taro-vue3-app` | 差异 | 中高风险 | +81.1 KiB | 10 | [report](demo/taro-vue3-app/report.md) | [artifact.diff](demo/taro-vue3-app/artifact.diff) |
| `demo/taro-webpack-tailwindcss-v4` | 差异 | 中高风险 | -1.5 KiB | 5 | [report](demo/taro-webpack-tailwindcss-v4/report.md) | [artifact.diff](demo/taro-webpack-tailwindcss-v4/artifact.diff) |
| `demo/uni-app-tailwindcss-v4` | 差异 | 中高风险 | +22.0 KiB | 5 | [report](demo/uni-app-tailwindcss-v4/report.md) | [artifact.diff](demo/uni-app-tailwindcss-v4/artifact.diff) |
| `demo/uni-app-tailwindcss-v5` | 当前新增 | 新增项目 | +54.2 KiB | 22 | [report](demo/uni-app-tailwindcss-v5/report.md) | [artifact.diff](demo/uni-app-tailwindcss-v5/artifact.diff) |
| `demo/uni-app-vue3-vite` | 差异 | 中高风险 | +88.8 KiB | 14 | [report](demo/uni-app-vue3-vite/report.md) | [artifact.diff](demo/uni-app-vue3-vite/artifact.diff) |
| `demo/uni-app-x-hbuilderx-tailwindcss3` | 无产物 | 无产物 | 0 B | 0 | [report](demo/uni-app-x-hbuilderx-tailwindcss3/report.md) | [artifact.diff](demo/uni-app-x-hbuilderx-tailwindcss3/artifact.diff) |
| `demo/uni-app-x-hbuilderx-tailwindcss4` | 无产物 | 无产物 | 0 B | 0 | [report](demo/uni-app-x-hbuilderx-tailwindcss4/report.md) | [artifact.diff](demo/uni-app-x-hbuilderx-tailwindcss4/artifact.diff) |
| `demo/web` | 无产物 | 无产物 | 0 B | 0 | [report](demo/web/report.md) | [artifact.diff](demo/web/artifact.diff) |

## 需要进一步验证的方向

- 对 P0 项目，先确认模板/脚本 diff 是否只是构建 hash 或 sourcemap 引起；如果 class 字符串、转译函数或运行时 helper 变化，需要补针对性测试。
- 对 P1 项目，建议从 `app.wxss`、分包页面 wxss、组件库 wxss 中抽样比对选择器集合，判断 v5 增量是更完整的生成，还是重复注入。
- 对 v5 新增 demo，main 无对应目录，只能作为 v5 自身质量样本，不纳入兼容性等价判断。
- 最终目标是“v4 行为兼容 + v5 样式质量更高”：兼容性用核心产物路径/选择器/模板 class 等价性保证，质量用更完整覆盖、更少冗余、更稳定输出衡量。
