# `@weapp-tailwindcss/cn` vs `@weapp-tailwindcss/merge` 性能报告

这份报告可以单独阅读，不依赖对比报告。这里只比 weapp 包装后的 `cn` / `merge`。上游 npm `cn` 对 `tailwind-merge` 的宣称倍数见 [`upstream-cn-vs-tailwind-merge.md`](./upstream-cn-vs-tailwind-merge.md)。数字全部来自本机实测。

## 结论摘要

- last-wins 稳态：`cn` 3.08 M ops/s，`merge` 5.88 M ops/s（merge/cn = 1.91×）。
- cache-hit：`cn` 3.59 M ops/s，`merge` 8.45 M ops/s。
- cache-miss：`cn` 850.5 k ops/s，`merge` 301.9 k ops/s。
- 消费者 minify gzip：`cn` 12.6 KiB，`merge` 11.5 KiB。
- 语义：`cn` 与 `merge` 不一致的静态 case 为 `rpx-text-color-keep`、`numeric-leading-escaped`。输出不同的行不能只按速度排名。

## 环境

- 时间：2026-09-15T01:48:04.093Z
- Commit：`f6ca9652d44753cbe7cb4cbc2469e6cd61ed6944`
- Node：v24.18.0
- OS：darwin 25.6.0 (arm64)
- CPU：Apple M4 Max
- 内存：131072.00 MiB

## 方法

- 每个受试者在**独立 Node 子进程**中加载，避免 JIT 和缓存互相污染。
- 子进程启用 `--expose-gc`。
- 先测冷启动（import 后第一次调用），再 warmup 300 次，然后采集 400 个稳态样本；每个样本是 25 次调用的平均耗时。
- 延迟用 `process.hrtime.bigint()`，ops/s 由稳态中位数换算。
- 内存：`cache-hit` / `cache-miss` / `long-list` 在 GC 后各跑 8000 次，看 `heapUsed` 增量。
- 体积：esbuild `bundle + minify`，再 gzip9 / brotli。工作目录是本 package，以便解析 workspace 依赖。
- `lite` 只 join，不参与「谁合并得更快」的结论。

### 受试者

| id | 实现 | escape | 冲突合并 |
| --- | --- | --- | --- |
| weapp-cn | @weapp-tailwindcss/cn | 是 | 是 |
| weapp-merge | @weapp-tailwindcss/merge | 是 | 是 |
| weapp-merge-slim | @weapp-tailwindcss/merge/slim | 是 | 是 |
| weapp-merge-lite | @weapp-tailwindcss/merge/lite (twJoin) | 是 | 否（join） |

## 体积

| 受试者 | raw | gzip9 | brotli |
| --- | --- | --- | --- |
| @weapp-tailwindcss/cn | 30.4 KiB | 12.6 KiB | 11.1 KiB |
| @weapp-tailwindcss/merge | 34.5 KiB | 11.5 KiB | 10.1 KiB |
| @weapp-tailwindcss/merge/slim | 24.8 KiB | 9.2 KiB | 8.3 KiB |
| @weapp-tailwindcss/merge/lite | 11.1 KiB | 4.8 KiB | 4.3 KiB |
| cn() | 25.4 KiB | 10.4 KiB | 9.2 KiB |
| cn.twMerge | 25.4 KiB | 10.4 KiB | 9.2 KiB |
| tailwind-merge twMerge | 26.8 KiB | 8.4 KiB | 7.3 KiB |
| clsx + tailwind-merge | 27.1 KiB | 8.5 KiB | 7.4 KiB |

## 主对比：weapp-cn vs weapp-merge

`merge/cn` > 1 表示 merge 更快。`输出` 列来自同一套静态对拍。

| Case | cn ops/s | merge ops/s | cn p50 | merge p50 | cn p95 | merge p95 | merge/cn | 较快 | 输出 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| short-no-conflict | 4.07 M ops/s | 42.88 M ops/s | 245 ns | 23 ns | 533 ns | 90 ns | 10.54× | merge | 相同 |
| last-wins | 3.08 M ops/s | 5.88 M ops/s | 325 ns | 170 ns | 405 ns | 272 ns | 1.91× | merge | 相同 |
| clsx-object-array | 7.14 M ops/s | 11.54 M ops/s | 140 ns | 87 ns | 373 ns | 188 ns | 1.62× | merge | 相同 |
| refinement-padding | 11.11 M ops/s | 19.35 M ops/s | 90 ns | 52 ns | 95 ns | 58 ns | 1.74× | merge | 相同 |
| rpx-width | 4.58 M ops/s | 10.71 M ops/s | 218 ns | 93 ns | 228 ns | 100 ns | 2.34× | merge | 相同 |
| rpx-text-length | 4.17 M ops/s | 11.11 M ops/s | 240 ns | 90 ns | 252 ns | 127 ns | 2.67× | merge | 相同 |
| rpx-text-color-keep | 4.38 M ops/s | 10.34 M ops/s | 228 ns | 97 ns | 282 ns | 115 ns | 2.36× | merge | 输出不同 |
| escaped-modifier | 2.51 M ops/s | 10.17 M ops/s | 398 ns | 98 ns | 490 ns | 123 ns | 4.05× | merge | 相同 |
| stacked-modifiers | 3.01 M ops/s | 9.52 M ops/s | 332 ns | 105 ns | 378 ns | 108 ns | 3.16× | merge | 相同 |
| important-postfix | 4.62 M ops/s | 10.00 M ops/s | 217 ns | 100 ns | 225 ns | 108 ns | 2.17× | merge | 相同 |
| custom-plus-tailwind | 5.22 M ops/s | 9.38 M ops/s | 192 ns | 107 ns | 200 ns | 132 ns | 1.80× | merge | 相同 |
| arbitrary-variant | 2.39 M ops/s | 8.33 M ops/s | 418 ns | 120 ns | 440 ns | 150 ns | 3.49× | merge | 相同 |
| numeric-leading-escaped | 1.72 M ops/s | 12.00 M ops/s | 580 ns | 83 ns | 695 ns | 103 ns | 6.96× | merge | 输出不同 |
| slim-excluded-fill | 4.73 M ops/s | 10.71 M ops/s | 212 ns | 93 ns | 217 ns | 98 ns | 2.27× | merge | 相同 |
| long-list | 356.8 k ops/s | 1.55 M ops/s | 2.80 µs | 645 ns | 3.34 µs | 713 ns | 4.34× | merge | 相同 |
| component-call | 2.50 M ops/s | 7.32 M ops/s | 400 ns | 137 ns | 445 ns | 175 ns | 2.93× | merge | 相同 |
| arbitrary-heavy | 835.6 k ops/s | 4.80 M ops/s | 1.20 µs | 208 ns | 1.31 µs | 213 ns | 5.74× | merge | 相同 |
| component-call-fresh | 2.42 M ops/s | 6.74 M ops/s | 413 ns | 148 ns | 475 ns | 187 ns | 2.79× | merge | 相同 |
| working-set | 1.92 M ops/s | 5.71 M ops/s | 522 ns | 175 ns | 558 ns | 218 ns | 2.98× | merge | 相同 |

## 全受试者吞吐

| Case | weapp-cn | weapp-merge | weapp-merge-slim | weapp-merge-lite |
| --- | --- | --- | --- | --- |
| short-no-conflict | 4.07 M ops/s | 42.88 M ops/s | 42.88 M ops/s | 38.73 M ops/s |
| last-wins | 3.08 M ops/s | 5.88 M ops/s | 6.12 M ops/s | 6.00 M ops/s |
| clsx-object-array | 7.14 M ops/s | 11.54 M ops/s | 11.54 M ops/s | 12.00 M ops/s |
| refinement-padding | 11.11 M ops/s | 19.35 M ops/s | 20.00 M ops/s | 20.00 M ops/s |
| rpx-width | 4.58 M ops/s | 10.71 M ops/s | 10.53 M ops/s | 10.71 M ops/s |
| rpx-text-length | 4.17 M ops/s | 11.11 M ops/s | 11.11 M ops/s | 10.71 M ops/s |
| rpx-text-color-keep | 4.38 M ops/s | 10.34 M ops/s | 10.17 M ops/s | 9.52 M ops/s |
| escaped-modifier | 2.51 M ops/s | 10.17 M ops/s | 10.72 M ops/s | 10.17 M ops/s |
| stacked-modifiers | 3.01 M ops/s | 9.52 M ops/s | 9.67 M ops/s | 9.23 M ops/s |
| important-postfix | 4.62 M ops/s | 10.00 M ops/s | 10.35 M ops/s | 9.84 M ops/s |
| custom-plus-tailwind | 5.22 M ops/s | 9.38 M ops/s | 9.52 M ops/s | 9.09 M ops/s |
| arbitrary-variant | 2.39 M ops/s | 8.33 M ops/s | 8.22 M ops/s | 8.11 M ops/s |
| numeric-leading-escaped | 1.72 M ops/s | 12.00 M ops/s | 11.76 M ops/s | 11.32 M ops/s |
| slim-excluded-fill | 4.73 M ops/s | 10.71 M ops/s | 10.72 M ops/s | 10.91 M ops/s |
| long-list | 356.8 k ops/s | 1.55 M ops/s | 1.54 M ops/s | 1.52 M ops/s |
| component-call | 2.50 M ops/s | 7.32 M ops/s | 7.32 M ops/s | 7.32 M ops/s |
| arbitrary-heavy | 835.6 k ops/s | 4.80 M ops/s | 4.69 M ops/s | 4.69 M ops/s |
| cache-hit | 3.59 M ops/s | 8.45 M ops/s | 8.57 M ops/s | 8.45 M ops/s |
| cache-miss | 850.5 k ops/s | 301.9 k ops/s | 304.5 k ops/s | 552.2 k ops/s |
| component-call-fresh | 2.42 M ops/s | 6.74 M ops/s | 6.74 M ops/s | 6.82 M ops/s |
| working-set | 1.92 M ops/s | 5.71 M ops/s | 5.71 M ops/s | 5.71 M ops/s |

## 冷启动（第一次调用）

| Case | weapp-cn | weapp-merge | weapp-merge-slim | weapp-merge-lite |
| --- | --- | --- | --- | --- |
| short-no-conflict | 513.75 µs | 2.06 ms | 1.48 ms | 171.25 µs |
| last-wins | 185.92 µs | 257.96 µs | 209.71 µs | 61.63 µs |
| clsx-object-array | 110.75 µs | 78.54 µs | 79.79 µs | 45.13 µs |
| refinement-padding | 32.33 µs | 24.63 µs | 47.21 µs | 22.88 µs |
| rpx-width | 154.88 µs | 171.04 µs | 209.04 µs | 172.42 µs |
| rpx-text-length | 197.00 µs | 85.96 µs | 107.08 µs | 98.46 µs |
| rpx-text-color-keep | 25.29 µs | 45.04 µs | 58.79 µs | 75.46 µs |
| escaped-modifier | 202.38 µs | 125.71 µs | 147.71 µs | 269.25 µs |
| stacked-modifiers | 57.58 µs | 54.33 µs | 89.71 µs | 60.04 µs |
| important-postfix | 33.13 µs | 16.29 µs | 25.29 µs | 17.17 µs |
| custom-plus-tailwind | 58.38 µs | 43.50 µs | 29.75 µs | 15.29 µs |
| arbitrary-variant | 54.46 µs | 22.13 µs | 22.88 µs | 15.13 µs |
| numeric-leading-escaped | 78.00 µs | 36.21 µs | 40.67 µs | 35.54 µs |
| slim-excluded-fill | 19.33 µs | 43.96 µs | 8.79 µs | 8.00 µs |
| long-list | 125.83 µs | 243.54 µs | 138.04 µs | 65.38 µs |
| component-call | 28.54 µs | 37.67 µs | 53.58 µs | 14.21 µs |
| arbitrary-heavy | 240.38 µs | 400.25 µs | 333.71 µs | 19.08 µs |
| cache-hit | 25.29 µs | 14.71 µs | 24.67 µs | 23.75 µs |
| cache-miss | 25.21 µs | 80.75 µs | 74.13 µs | 46.00 µs |
| component-call-fresh | 15.88 µs | 217.38 µs | 251.21 µs | 9.33 µs |
| working-set | 23.13 µs | 19.71 µs | 23.83 µs | 5.54 µs |

## 缓存与内存

| Case | weapp-cn | weapp-merge | weapp-merge-slim | weapp-merge-lite |
| --- | --- | --- | --- | --- |
| cache-hit | 3.59 M ops/s | 8.45 M ops/s | 8.57 M ops/s | 8.45 M ops/s |
| cache-miss | 850.5 k ops/s | 301.9 k ops/s | 304.5 k ops/s | 552.2 k ops/s |
| working-set | 1.92 M ops/s | 5.71 M ops/s | 5.71 M ops/s | 5.71 M ops/s |

heapUsed 增量（8000 次调用后，负值表示 GC 后堆变小）：

| Case | weapp-cn | weapp-merge | weapp-merge-slim | weapp-merge-lite |
| --- | --- | --- | --- | --- |
| cache-hit | 2.7 KiB | 64 B | 128 B | -1.6 KiB |
| cache-miss | -34.8 KiB | 24.9 KiB | 23.3 KiB | 6.4 KiB |
| long-list | -7.7 KiB | -21.8 KiB | -17.4 KiB | -13.0 KiB |
| working-set | 4.3 KiB | -4.5 KiB | -4.5 KiB | 4.4 KiB |

## 如何阅读这些数字

- 每个受试者进程的**第一条 case**（本矩阵是 `short-no-conflict`）包含引擎初始化，冷启动会明显偏大；后面的 case 才是「函数已热」的第一次调用。
- 命中缓存时 `merge` 外层 LRU 让稳态更快；唯一输入的 `cache-miss` 上 `cn` 通常更快，因为它没有 rpx prepare/restore，引擎表查找比 `tailwind-merge` 配置图更轻。
- 上游 `cn` 在命中路径可以到数千万 ops/s，weapp `cn` 慢一截主要是每次 escape/unescape。这是小程序兼容成本，不是引擎退化。
- gzip 后默认 `merge` 可能略小于 `cn`：`tailwind-merge` 压缩率更好，`cn` 的编译表 + engine 压缩后不一定更小。
- `lite` 只 join，不参与「谁合并得更快」。
- 本机结果不能当 CI 门禁；相对顺序比绝对值更有参考价值。

生成时间：2026-09-15T02:56:52.847Z

