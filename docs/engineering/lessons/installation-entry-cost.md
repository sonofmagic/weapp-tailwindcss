---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/pull/1256
baseline: bc42340685067d13e0ddc665197662848faaacfa
regressions:
  - benchmark/performance/demo/test/entry-report.test.mjs
  - benchmark/performance/demo/test/memory-drain.test.mjs
  - benchmark/performance/demo/test/runtime-dependency.test.mjs
  - benchmark/performance/demo/test/source-artifact-identity.test.mjs
---

# 安装依赖与入口加载成本

## 症状

用户希望区分安装、入口加载、首次生成和框架编译的成本。PostCSS 包声明了 `es-toolkit`，但源码、声明及打包 JS 都没有消费它。根开发工具仍有真实用途，不能删除共享 catalog 或全仓依赖。

前一轮代表 demo 的测量还出现短进程 RSS 缺样本、Webpack/Taro 连续保存后 marker 未到达的问题。失败记录继续保留在上一份复盘中，不能因为后来一次通过而覆盖。

## 根因与纠正

仅移除 `packages/postcss/package.json` 的生产依赖。独立项目安装完整内部 tarball 闭包，不使用 workspace 链接；外部依赖版本与 integrity 逐项比较，只允许显式列出的确切包版本新增或移除。未声明变化、范围版本以及已有版本的 integrity 改变仍失败。源码实验可显式指定 registry，并在报告中记录，避免把镜像准备过程解释为 npm 官方下载速度。

短进程退出时，已发出的 `ps` 内存采样可能还没有返回。现在等待该次采样回收后读取 RSS，耗时仍取进程退出时刻。回归先在旧实现失败，再在新实现通过。这只修复丢失已发出的采样，250 ms 轮询仍不是操作系统提供的精确进程树峰值，也不能保证任意短命进程都有有效 RSS。

隔离消费项目此前移除了 `packageManager`，导致仓库使用 pnpm 12.6.0、消费项目却使用机器默认的 12.8.1。三组现在保留仓库确切包管理器版本；旧报告仍保留原版本，不与新口径拼接。

## 验证

环境：macOS arm64、Apple M4 Max、Node 24.18.0、pnpm 12.6.0。被测为源码打包产物，不是 npm 稳定版周报。基线来自合并 #1256 后的主分支；比较组仅移除未使用的依赖，运行时 JS 相同。

最小独立消费项目安装 `weapp-tailwindcss`、PostCSS 包和相同确切版本的 Tailwind。两批采用相反的版本顺序，每批离线重装 7 轮，每个入口及 ESM/CJS 组合使用 7 个新 Node 进程。样本串行，profile 单独执行。OS 文件缓存保持温热，不代表机器冷启动。

| 安装指标 | 优化前 | 优化后 | 差值 |
| --- | --- | --- | --- |
| 锁文件包数量（含可选平台包） | 256 | 255 | -1 |
| 本机安装包实例 | 217 | 216 | -1 |
| node_modules 文件内容总量 | 54,396,629 B | 50,164,368 B | -4,232,261 B |
| 移除依赖的下载归档 | 515,327 B | 无 | -515,327 B |

空间按文件内容大小统计、忽略符号链接并对硬链接去重，不等同于 APFS 物理块或全机共享 store 占用。归档通过 HTTPS npmmirror 获取并核对 SHA-512 integrity，与锁文件一致；不声称 npm 官方网络安装提速比例。若项目的其他依赖也需要 es-toolkit，实际空间收益会减少或消失。

| 离线重装批次 | 优化前 median / p95 ms | 优化后 median / p95 ms | median 差值 |
| --- | --- | --- | --- |
| 1 | 354.65 / 391.35 | 281.67 / 326.23 | -72.98 ms / -20.58% |
| 2 | 390.12 / 411.76 | 322.87 / 330.90 | -67.26 ms / -17.24% |

两批进程树 RSS median 分别为 109.30→103.80 MiB、107.81→103.00 MiB。这里不是同一 demo 的完整安装实验，不能将该比例直接套用到已有大型 Taro/uni-app 项目。

入口加载没有一致的优化收益。两批合计 14 个新进程的加载 median 如下；初始化、首次生成、首次转换和全程耗时均在 JSON 中独立保存，首次转换还断言自定义 PostCSS 插件被执行。

| 入口 | ESM 前→后 ms | CJS 前→后 ms |
| --- | --- | --- |
| 根入口 | 314.65→318.60 | 226.38→231.93 |
| Vite | 211.88→210.62 | 205.57→204.60 |
| Webpack | 192.59→196.93 | 185.02→186.39 |
| PostCSS | 133.06→132.61 | 130.60→130.54 |

独立 Vite ESM CPU profile 的叶帧采样包含模块加载器、Browserslist、Autoprefixer 和 preset-env。一次样本中 Browserslist 约 23.75 ms、Autoprefixer prefixes 约 9.00 ms、preset-env 约 7.46 ms。这些采样不能相加推导框架提速，也不能证明延迟加载后首次使用成本消失。当前 StyleHandler 已在首次内容到达时才创建管线；同步 getPipeline、默认兼容转换和 Babel 回退都仍需保留。本轮不提交未被端到端收益支持的生产懒加载改动。

复现入口：

```sh
pnpm --filter weapp-tailwindcss... run build
node benchmark/performance/scripts/source-generation/pack.mjs --source <提交> --out-dir .tmp/entry-cost/<版本>
node benchmark/performance/scripts/source-generation/entry-cost.mjs --before <基线清单> --after <比较清单> --dependency-changes <确切变更JSON> --out-dir .tmp/entry-cost/entry-samples
```

独立 profiling 使用相同命令另加 `--profile`，输出到独立目录。本地官方 registry 存在 TLS 主机名验证失败，实验显式使用 `--registry https://registry.npmmirror.com`，没有关闭证书验证。完整原始样本、锁文件、安装日志、profile 与 tarball 身份保存在忽略目录 `.tmp/entry-cost/`。

本地定向验证：性能工具 32 文件 / 106 项通过（另补非有限样本拒绝回归）；PostCSS 自定义插件、来源、所有权、颜色和构建配置 15 项通过；主包运行时闭包构建通过；架构和规则检查通过。新增入口脚本显式执行 `eslint --no-ignore`，避免根配置忽略 benchmark 造成虚假的 lint 通过。`pnpm release status` 及镜像重试均被 registry 连接拒绝阻断，未宣称发布计划检查通过。

## 适用边界

代表 demo 的两批三组测量单独保存，不使用入口微基准替代真实构建或 HMR。此前 marker 失联的诊断仍按失败报告：相同基线 tarball 的四批诊断中，Webpack 四批通过；Taro 第一批接入组在恢复文本状态时，源码已是新 marker、输出 JS 仍是旧 marker，另三批通过。不能用后三批覆盖首次失败，也不据此提交推测性的缓存修补。

未修改 demo 源码、默认样式语义、用户配置 API 或性能预算。每次源码实验准备都重新生成并归档 static 输入，计时阶段仅验证。没有执行本地全端预检或全面验收，不能宣称 Windows/Linux、IDE、设备及全部 CLI 目标已完成。

## 规则评估

不新增 AGENTS 规则。使用可执行回归约束异步采样回收、包管理器固定和依赖实验范围；继续区分微基准、源码 tarball 与 npm 发布版周报。
