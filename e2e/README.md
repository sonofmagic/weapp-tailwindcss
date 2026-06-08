# E2E Demo 覆盖说明

本目录的 demo 覆盖矩阵由 `e2e/demoCoverageMatrix.ts` 维护，并由 `e2e/e2e-matrix.test.ts` 校验。矩阵会扫描 `demo/*/package.json` 与 `demo/web/*/package.json`，确保每个 demo、平台脚本、静态构建、HMR 或本地豁免都有明确状态。

常用验证命令：

- 总矩阵一致性：`pnpm exec vitest run -c ./e2e/vitest.e2e.config.ts e2e/e2e-matrix.test.ts`
- 静态小程序快照：`E2E_SKIP_OPEN_AUTOMATOR=1 pnpm e2e:static`
- 多平台构建输出：`pnpm e2e:multiplatform-build`
- 单个平台构建输出：`E2E_MULTIPLATFORM_BUILD_CASE="<demo> <platform>" pnpm e2e:multiplatform-build`
- demo watch/HMR：`pnpm e2e:hot-update:demo`
- 单个 watch/HMR case：`E2E_HOT_UPDATE_CASE_NAME=<demo> pnpm e2e:hot-update:demo`
- 微信开发者工具 IDE 类名 HMR：`pnpm e2e:ide`
- 微信开发者工具 IDE 类名 HMR + 前后截图：`pnpm e2e:ide:visual`
- 单个 demo 的 IDE 前后截图：`DEMO_VISUAL_FILTER=<demo> pnpm e2e:ide:visual:case`
- 完整 IDE HMR 流程：`pnpm e2e:ide:full`
- Web Vite HMR：`pnpm exec vitest run -c ./e2e/vitest.e2e.config.ts e2e/web-vite-demo-hmr.test.ts`
- Web 与 weapp 模式对比：`pnpm demo:web:compare`
- HBuilderX 本地链路：`E2E_HBUILDERX_LOCAL=1 pnpm e2e:hbuilderx:local`

HBuilderX / App / 模拟器相关 case 依赖本机工具链，默认不进入普通 CI。矩阵中的 `reason` 字段记录了跳过原因和对应本地命令。
`e2e:ide:visual` 会遍历 `demo/*` 的所有小程序 demo，在微信开发者工具里截取 HMR 前后画面；任一 demo 跳过、失败或没有匹配结果都会让命令失败。
为避免连续打开多个 demo 后 DevTools 连接残留影响后续 HMR，`e2e:ide:visual` 默认在每个小程序 case 前后关闭微信开发者工具，并在 launch 超时后重试一次。需要保留已打开 IDE 调试时，可临时设置 `DEMO_VISUAL_IDE_CLEANUP=0`。
