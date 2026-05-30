# E2E Demo 覆盖说明

本目录的 demo 覆盖矩阵由 `e2e/demoCoverageMatrix.ts` 维护，并由 `e2e/e2e-matrix.test.ts` 校验。矩阵会扫描 `demo/*/package.json` 与 `demo/web/*/package.json`，确保每个 demo、平台脚本、静态构建、HMR 或本地豁免都有明确状态。

常用验证命令：

- 总矩阵一致性：`pnpm exec vitest run -c ./e2e/vitest.e2e.config.ts e2e/e2e-matrix.test.ts`
- 静态小程序快照：`E2E_SKIP_OPEN_AUTOMATOR=1 pnpm e2e:static`
- 多平台构建输出：`pnpm e2e:multiplatform-build`
- 单个平台构建输出：`E2E_MULTIPLATFORM_BUILD_CASE="<demo> <platform>" pnpm e2e:multiplatform-build`
- demo watch/HMR：`pnpm e2e:hot-update:demo`
- 单个 watch/HMR case：`E2E_HOT_UPDATE_CASE_NAME=<demo> pnpm e2e:hot-update:demo`
- Web Vite HMR：`pnpm exec vitest run -c ./e2e/vitest.e2e.config.ts e2e/web-vite-demo-hmr.test.ts`
- Web 与 weapp 模式对比：`pnpm demo:web:compare`
- HBuilderX 本地链路：`E2E_HBUILDERX_LOCAL=1 pnpm e2e:hbuilderx:local`

HBuilderX / App / 模拟器相关 case 依赖本机工具链，默认不进入普通 CI。矩阵中的 `reason` 字段记录了跳过原因和对应本地命令。
