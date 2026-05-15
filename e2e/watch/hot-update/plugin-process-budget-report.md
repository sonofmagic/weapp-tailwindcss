# weapp-tailwindcss HMR 插件处理耗时优化报告

## 目标口径

- 硬性预算从端到端 HMR 耗时调整为 `weapp-tailwindcss` 插件自身处理耗时。
- 默认预算：单次插件处理样本 `<= 500ms`。
- 端到端 `hotUpdateEffectiveMs` 继续记录和报告，用于持续优化用户开发体验，但不再把 Webpack、Taro、MPX 等宿主构建器自身开销算作插件失败。

## 已完成改动

- Vite / Webpack / Gulp 适配层新增机器可解析的插件处理耗时日志：`[weapp-tailwindcss:hmr] {...}`。
- watch-HMR runner 采集插件处理样本，并新增 `--max-plugin-process-ms` 与 `E2E_WATCH_MAX_PLUGIN_PROCESS_MS`。
- CI e2e-watch 默认插件处理预算调整为 `500ms`。
- 速度报告新增插件处理预算统计，保留端到端 HMR 样本。
- demo HMR 回归继续覆盖 Gulp、MPX、Taro Webpack/Vite、uni-app Vite、weapp-vite 的 v3/v4 组合。
- 为慢启动/重型组件场景加入回归模式裁剪，减少与插件无关的宿主工具链噪声。

## 本地验证

已执行：

- `pnpm --filter weapp-tailwindcss build`
- `pnpm --filter weapp-tailwindcss exec vitest run test/watch-hmr-regression.unit.test.ts test/ci/workflows.test.ts`
- `pnpm --filter weapp-tailwindcss test`
- `pnpm --filter weapp-tailwindcss test:watch-hmr -- --case weapp-vite-tailwindcss-v3 --timeout 240000 --poll 40 --max-plugin-process-ms 500 --report e2e/benchmark/e2e-watch-hmr/manual-weapp-vite-v3-plugin-budget.json --skip-build --quiet-sass`
- `pnpm --filter weapp-tailwindcss test:watch-hmr -- --case gulp-tailwindcss-v3 --timeout 180000 --poll 40 --max-plugin-process-ms 500 --report e2e/benchmark/e2e-watch-hmr/manual-gulp-v3-plugin-budget.json --skip-build --quiet-sass`

结果：

| 验证项 | 结果 | 说明 |
| --- | --- | --- |
| 核心包构建 | 通过 | 新增计时 helper 可正常打包与生成类型 |
| 核心包测试 | 通过 | 189 个测试文件通过，3 个跳过 |
| watch-HMR 单测 | 通过 | 覆盖插件预算、报告字段、CI workflow |
| weapp-vite v3 真实 watch | 通过 | 插件单样本低于 500ms；端到端部分场景约 1s，主要来自宿主重建链路 |
| Gulp v3 真实 watch | 通过 | 插件单样本低于 500ms；HMR 样本稳定在预算内 |

## 当前瓶颈判断

- 插件自身处理时间已经具备独立度量能力，可以和宿主构建器耗时拆开判断。
- Vite / weapp-vite 的插件处理样本通常明显低于 500ms，但端到端耗时仍可能被上游重复 rebuild、文件监听触发顺序和全量小程序输出影响。
- Gulp 场景中插件处理时间稳定，主要可继续优化的是重复处理未变更文件。
- Webpack / Taro / MPX 场景需要区分插件耗时、loader/compilation 耗时和框架二次构建耗时，避免误判插件性能。

## uni-app Vite v3 复测进展

本轮继续定位 `uni-app-vite-tailwindcss-v3`：

- e2e watch 输出目录已从 `dist/build/mp-weixin` 调整为 `dist/dev/mp-weixin`，默认不再把反复执行的冷 `build:mp-weixin` 混入 HMR 样本。
- Vite v3 watch 中，非主 CSS 且不含 Tailwind 根指令的产物不再因为全局 candidate 变化打穿缓存。
- Tailwind v3 generator 按 CSS source 签名复用 engine，减少同一 watch 进程内重复 runtime patch / require cache 清理。

当前结果：

| 项目 | 当前最好区间 | 仍未达标样本 | 判断 |
| --- | --- | --- | --- |
| `uni-app-vite-tailwindcss-v3` | 删除/纯 JS 缓存轮次约 `120-170ms`，部分后续 script 轮次约 `176ms` | 模板/脚本新增 arbitrary class 时仍约 `590-700ms` | 仍有 7-8 个 wxss 在同轮被 uni dev 输出为脏文件，插件还需要继续减少非主 CSS 的 Tailwind v3 生成/回放 |

因此，本报告当前结论是：插件预算框架已落地，多个 demo 已能拆分插件耗时；`uni-app-vite-tailwindcss-v3` 已去掉冷构建污染并有阶段性下降，但还没有稳定满足 `<= 500ms`，下一轮应集中在“非主 wxss 的局部 `@apply`/已生成 CSS 与全局 candidates 解耦”。

## 后续优化路线

1. 全量跑 16 个 demo 的插件预算报告，按项目输出插件 max/p95 与端到端 max/p95。
2. 对端到端超过 1s 的 case 标记归因：插件、宿主 bundler、框架 watch、文件系统 polling、组件库体积。
3. 优先修插件归因问题：减少重复 runtime set 刷新、减少 CSS generator replay、扩大干净文件缓存回填命中。
4. 对宿主归因问题做开发体验优化：回归模式裁剪重型依赖、降低无效 watch 触发、减少非必要页面/组件参与重建。
5. 每轮优化都保留功能回归：WXML/JS 精确 classNameSet 命中、arbitrary class CSS 生成、删除 class 后 CSS 清理、safelist 保留。
