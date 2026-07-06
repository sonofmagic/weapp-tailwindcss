# Tailwind CSS v4 插件性能 Benchmark

该 workspace 包用于在同一份 Tailwind CSS v4 输入下，对比 `weapp-tailwindcss`、`@tailwindcss/postcss` 和 `@tailwindcss/vite` 的性能。

benchmark 是隔离的。官方 Tailwind 插件只安装并使用在该 benchmark 包内，不接入正常 demo/app 构建配置。

## Commands

```bash
pnpm run bench:tailwindcss-plugin
pnpm run bench:tailwindcss-plugin -- --runs 3 --warmups 1
pnpm run bench:tailwindcss-plugin:report
```

默认输出：

- `benchmark/tailwindcss-plugin-compare/data/latest.json`
- `benchmark/tailwindcss-plugin-compare/report.md`

## 参数

- `--runs`：每个 case 的正式测量轮数。默认：`5`。
- `--warmups`：正式测量前的预热轮数。默认：`1`。
- `--class-count`：默认规模场景的 Tailwind candidate 数量。默认：`600`。
- `--source-files`：默认规模场景的源码文件数量。默认：`12`。
- `--large-class-count`：大数量级选择器场景的 Tailwind candidate 数量。默认：`5000`。
- `--large-source-files`：大数量级选择器场景的源码文件数量。默认：`48`。
- `--skip-large`：跳过大数量级选择器场景。
- `--skip-hmr`：跳过 Vite dev/HMR 场景。
- `--out`：JSON 输出路径。
- `--report`：Markdown 报告输出路径。
- `--keep-temp`：保留临时 fixture 目录，便于检查生成输入。

## 场景

每次 benchmark 默认包含两种规模：

- 默认规模：用于常规对比。
- 大数量级选择器：用于观察 selector 数量上升后的生成、构建与 HMR 变化。

生成核心：

- `weapp-tailwindcss/generator`：`target=weapp`、`scanSources=true`。
- `weapp-tailwindcss/generator`：`target=web`、`scanSources=true`。
- `weapp-tailwindcss/generator`：`target=weapp`、`scanSources=false`、显式 candidates。
- `weapp-tailwindcss/generator`：`target=web`、`scanSources=false`、显式 candidates。
- `weapp-tailwindcss/generator`：incremental cache cold、hit、append 路径。
- `@tailwindcss/postcss`：直接 `postcss([tailwindcss()]).process(...)`。

完整 Vite build：

- Vite + `@tailwindcss/postcss`，通过 `css.postcss.plugins` 接入。
- Vite + `@tailwindcss/vite`。
- Vite + `weapp-tailwindcss/vite`，`generator.target='weapp'`。
- Vite + `weapp-tailwindcss/vite`，`generator.target='web'`。

Vite HMR：

- Vite dev server + `@tailwindcss/postcss`。
- Vite dev server + `@tailwindcss/vite`。
- Vite dev server + `weapp-tailwindcss/vite`，`generator.target='weapp'`。
- Vite dev server + `weapp-tailwindcss/vite`，`generator.target='web'`。

## 结果解读

生成核心用例隔离 CSS 生成成本，更适合对比插件生成性能。Vite build 用例包含 bundler 启动、Rollup 输出和插件集成开销，适合作为端到端参考。

Vite HMR 用例统计 Vite dev server 已启动后，临时源码文件写入、watcher change、module graph invalidation 与重新请求 CSS transform 的耗时；不包含浏览器 WebSocket 传输和页面应用样式的耗时。

内存数据来自同一 Node 进程的 `process.memoryUsage()`，记录每个 case 执行前后的 RSS/heap、采样峰值和增量。由于同一进程会复用模块缓存，且 V8 GC 时机不可控，RSS 增量适合看局部变化，RSS 峰值更适合判断占用上界。
