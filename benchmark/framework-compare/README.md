# framework-compare

该目录用于统一对比以下三组小程序技术栈：

- `uni-app vue3`（`demo/uni-app-vue3-vite`）
- `taro vue3`（`demo/taro-vue3-app`）
- `weapp-vite wevu`（`apps/vite-native-ts-skyline`）

## 对比维度

- Build：项目构建耗时（多轮统计）
- HMR：统一模板注入场景下的热更新耗时
- Runtime：`ref.value` 大批量更新性能（多数量级 + 操作次数）

## 统一场景说明

- Build / HMR / Runtime 采集前，脚本会将目标页面临时替换为同一份标准 Vue SFC，用完自动回滚，确保三套框架输入源码一致。
- HMR 统一修改“Vue SFC 页面模板（`.vue`）”，注入同一批 class 语料和 marker。
- HMR 优先使用 watch 口径（源码写入 -> 目标 `wxml` 出现 marker）；watch 不可用时自动回退为“源码写入 -> 完整 build 完成 + marker 命中”。
- Runtime 对三套框架统一执行 `ref.value` 批量赋值脚本（变量、写法、负载规模一致），默认对 `10,100,1000,10000,1000000` 五个数量级分别采样。

当前三组入口页分别为：

- `demo/uni-app-vue3-vite/src/pages/index/index.vue`
- `demo/taro-vue3-app/src/pages/index/index.vue`
- `apps/vite-native-ts-skyline/miniprogram/pages/cart/index.vue`

## 运行命令

在仓库根目录执行：

```bash
pnpm run bench:framework:matrix
pnpm run bench:framework:sanitize
pnpm run bench:framework:report
```

默认输出：

- 原始数据：`benchmark/framework-compare/data/framework-matrix-raw.json`
- Markdown 报告：`benchmark/framework-compare/report.md`

说明：

- Runtime 采样不依赖微信开发者工具，默认直接在各项目依赖环境中执行统一 `ref.value` 批量赋值基准。
- `bench:framework:sanitize` 会对结果中的绝对路径做脱敏（默认覆盖原始 JSON）。

## 常用参数

`bench:framework:matrix` 支持：

- `--build-runs <n>`：Build 轮数（默认 3）
- `--hmr-runs <n>`：HMR 轮数（默认 5）
- `--hmr-watch-retries <n>`：watch HMR 失败重试次数（默认 0）
- `--hmr-timeout <ms>`：watch HMR 单轮超时（默认 120000）
- `--runtime-runs <n>`：Runtime 轮数（默认 3）
- `--runtime-timeout <ms>`：每个 runtime 子阶段超时（默认 45000）
- `--ref-batch-scales <a,b,c,...>`：Runtime 数量级列表（默认 `10,100,1000,10000,1000000`）
- `--ref-batch-size <n>`：兼容单数量级写法（等价于 `--ref-batch-scales <n>`）
- `--ref-ops-per-round <n>`：每个数量级的基础 `ref.value` 赋值次数上限（默认 160）
- `--ref-max-elements-per-round <n>`：每轮最大元素预算，超大数量级会自动降低操作次数（默认 5000000）
- `--only <k1,k2,...>`：只跑指定框架 key（`uni-app-vue3` / `taro-vue3` / `weapp-vite-wevu`）
- `--skip-hmr`：跳过 HMR
- `--skip-runtime`：跳过 Runtime
- `--out <file>`：自定义原始报告输出路径
