# 上游 `cn` vs `tailwind-merge` 性能报告

这份报告只比较 npm 上的 `cn` 和 `tailwind-merge`，**不含** `@weapp-tailwindcss/*` 的 escape / rpx 包装。可以单独阅读。weapp 包装后的对比见 [`performance-report.md`](./performance-report.md)。

数字全部来自本目录脚本的本机实测。不用 `cn` README 的 30× / 37× / 172× 当结论。

## 结论摘要

- 版本：`cn@0.3.0`，`tailwind-merge@3.7.0`，`clsx@2.1.1`。
- 对标他们宣传的 drop-in：`cn()` vs `twMerge(clsx(...))`。
- 参数引用稳定的组件调用 `component-call`：cn 相对倍数 10.41×。
- 每次新建参数数组 `component-call-fresh`：5.85×。
- 64 组工作集循环 `working-set`：1.39×。
- 每次唯一字符串 `cache-miss`：0.36×。这条上更快的一方不一定是 cn。
- 长列表且参数引用稳定 `long-list`：43.17×。
- 语义：`cn()` vs `twMerge(clsx)` 不一致 无；`cn.twMerge` vs `twMerge` 不一致 无。

宣传里的 30× 来自「相同字符串实例 + 调用序列预测」，不是任意 class 合并都快 30 倍。唯一输入时优势会消失，有时还会更慢。

## 环境

- 时间：2026-09-15T01:48:04.093Z
- Commit：`f6ca9652d44753cbe7cb4cbc2469e6cd61ed6944`
- Node：v24.18.0
- OS：darwin 25.6.0 (arm64)
- CPU：Apple M4 Max
- 内存：131072.00 MiB

## 他们怎么宣称

[cn README](https://github.com/shadcn-ui/cn) 写的是 drop-in 替换 `clsx` + `tailwind-merge`，并且 [30× faster](https://github.com/shadcn-ui/cn#how-much-faster)。[how-it-works](https://github.com/shadcn-ui/cn/blob/main/docs/how-it-works.md) 把 30× 解释成：

1. 冲突规则编译成 typed array 表，运行时不再走 config / regex / Map trie。
2. **Argument cache**：组件反复传入同一批字符串实例时，指针比较后直接返回。
3. **调用序列预测**：render loop 里连 lookup 都跳过，大约 10 ns。
4. 字符串要出现两次才进 whole-string cache，一次性 SSR 字符串不污染缓存。

他们公布的表（不是本机数字）：

| 他们的 scenario | clsx + tailwind-merge | cn | 宣称倍数 | 本报告对应 case |
| --- | --- | --- | --- | --- |
| the call your components make most | 320 ns | 10 ns | 30× | component-call |
| same classes as last render (cache hit) | 14 ns | 7 ns | 1.9× | cache-hit / component-call |
| typical component strings, warm | 13 ns | 7 ns | 1.9× | last-wins / short-no-conflict |
| thousands of recurring strings | 2.4 µs | 14 ns | 172× | working-set |
| cold render, many arbitrary values | 3.4 µs | 1.1 µs | 3.0× | arbitrary-heavy + cache-miss 形态 |
| cold render, SSR-style unique strings | 2.3 µs | 360 ns | 6.4× | cache-miss |
| very first call (page load) | 3.2 ms | 0.4 ms | 7× | 进程内第一条 case 的 coldStart |

方法差异：他们每个实现 × 负载单独子进程、warmup、取 5 次 timed block 的最好成绩。我们是每个实现一个子进程，跑完全部 case；warmup 300 次后采 400 个稳态样本（每样本 25 次调用的平均）。绝对值不能和他们那张表逐 ns 对齐，看相对倍数和「什么负载快」。

## 受试者

| id | 调用 | 对标 |
| --- | --- | --- |
| upstream-cn | `cn()` | 他们推荐的 drop-in |
| upstream-cn-twmerge | `cn.twMerge()` | 只合并，不含 clsx 风格对象 |
| upstream-twmerge | `twMerge()` | tailwind-merge 本体 |
| upstream-twmerge-clsx | `twMerge(clsx(...))` | 今天大多数项目的写法 |

## 体积（esbuild minify，含传递依赖）

| 受试者 | raw | gzip9 | brotli |
| --- | --- | --- | --- |
| cn() | 25.4 KiB | 10.4 KiB | 9.2 KiB |
| cn.twMerge | 25.4 KiB | 10.4 KiB | 9.2 KiB |
| tailwind-merge twMerge | 26.8 KiB | 8.4 KiB | 7.3 KiB |
| clsx + tailwind-merge | 27.1 KiB | 8.5 KiB | 7.4 KiB |

## 主对比：`cn()` vs `twMerge(clsx(...))`

`cn/twMerge(clsx)` > 1 表示 cn 更快。

| Case | cn() ops/s | twMerge(clsx) ops/s | cn p50 | tw p50 | cn/tw | 较快 | 输出 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| short-no-conflict | 33.33 M ops/s | 20.00 M ops/s | 30 ns | 50 ns | 1.67× | cn() | 相同 |
| last-wins | 33.33 M ops/s | 6.82 M ops/s | 30 ns | 147 ns | 4.89× | cn() | 相同 |
| clsx-object-array | 10.08 M ops/s | 10.17 M ops/s | 98 ns | 98 ns | 0.99× | twMerge(clsx) | 相同 |
| refinement-padding | 33.33 M ops/s | 15.38 M ops/s | 30 ns | 65 ns | 2.17× | cn() | 相同 |
| rpx-width | 59.95 M ops/s | 12.25 M ops/s | 17 ns | 82 ns | 4.89× | cn() | 相同 |
| rpx-text-length | 35.31 M ops/s | 13.33 M ops/s | 28 ns | 75 ns | 2.65× | cn() | 相同 |
| rpx-text-color-keep | 66.67 M ops/s | 14.29 M ops/s | 15 ns | 70 ns | 4.67× | cn() | 相同 |
| escaped-modifier | 59.95 M ops/s | 14.29 M ops/s | 17 ns | 70 ns | 4.20× | cn() | 相同 |
| stacked-modifiers | 59.95 M ops/s | 12.25 M ops/s | 17 ns | 82 ns | 4.89× | cn() | 相同 |
| important-postfix | 28.57 M ops/s | 14.64 M ops/s | 35 ns | 68 ns | 1.95× | cn() | 相同 |
| custom-plus-tailwind | 54.59 M ops/s | 12.50 M ops/s | 18 ns | 80 ns | 4.37× | cn() | 相同 |
| arbitrary-variant | 66.67 M ops/s | 9.83 M ops/s | 15 ns | 102 ns | 6.78× | cn() | 相同 |
| numeric-leading-escaped | 60.10 M ops/s | 15.00 M ops/s | 17 ns | 67 ns | 4.01× | cn() | 相同 |
| slim-excluded-fill | 60.10 M ops/s | 13.04 M ops/s | 17 ns | 77 ns | 4.61× | cn() | 相同 |
| long-list | 66.67 M ops/s | 1.54 M ops/s | 15 ns | 647 ns | 43.17× | cn() | 相同 |
| component-call | 85.62 M ops/s | 8.22 M ops/s | 12 ns | 122 ns | 10.41× | cn() | 相同 |
| arbitrary-heavy | 85.62 M ops/s | 5.13 M ops/s | 12 ns | 195 ns | 16.70× | cn() | 相同 |
| cache-hit | 50.00 M ops/s | 9.38 M ops/s | 20 ns | 107 ns | 5.33× | cn() | — |
| cache-miss | 283.8 k ops/s | 779.2 k ops/s | 3.52 µs | 1.28 µs | 0.36× | twMerge(clsx) | — |
| component-call-fresh | 42.81 M ops/s | 7.32 M ops/s | 23 ns | 137 ns | 5.85× | cn() | — |
| working-set | 8.11 M ops/s | 5.82 M ops/s | 123 ns | 172 ns | 1.39× | cn() | — |

## 合并本体：`cn.twMerge` vs `twMerge`

去掉 clsx，只比冲突合并。

| Case | cn.twMerge ops/s | twMerge ops/s | cn p50 | tw p50 | cn/tw | 较快 |
| --- | --- | --- | --- | --- | --- | --- |
| short-no-conflict | 37.54 M ops/s | 31.57 M ops/s | 27 ns | 32 ns | 1.19× | cn.twMerge |
| last-wins | 6.38 M ops/s | 6.59 M ops/s | 157 ns | 152 ns | 0.97× | twMerge |
| clsx-object-array | 14.63 M ops/s | 13.64 M ops/s | 68 ns | 73 ns | 1.07× | cn.twMerge |
| refinement-padding | 18.75 M ops/s | 20.00 M ops/s | 53 ns | 50 ns | 0.94× | twMerge |
| rpx-width | 16.67 M ops/s | 14.29 M ops/s | 60 ns | 70 ns | 1.17× | cn.twMerge |
| rpx-text-length | 15.00 M ops/s | 14.63 M ops/s | 67 ns | 68 ns | 1.03× | cn.twMerge |
| rpx-text-color-keep | 15.78 M ops/s | 15.01 M ops/s | 63 ns | 67 ns | 1.05× | cn.twMerge |
| escaped-modifier | 16.21 M ops/s | 15.79 M ops/s | 62 ns | 63 ns | 1.03× | cn.twMerge |
| stacked-modifiers | 12.77 M ops/s | 13.04 M ops/s | 78 ns | 77 ns | 0.98× | twMerge |
| important-postfix | 15.38 M ops/s | 16.67 M ops/s | 65 ns | 60 ns | 0.92× | twMerge |
| custom-plus-tailwind | 14.64 M ops/s | 13.95 M ops/s | 68 ns | 72 ns | 1.05× | cn.twMerge |
| arbitrary-variant | 11.11 M ops/s | 10.91 M ops/s | 90 ns | 92 ns | 1.02× | cn.twMerge |
| numeric-leading-escaped | 17.14 M ops/s | 17.15 M ops/s | 58 ns | 58 ns | 1.00× | twMerge |
| slim-excluded-fill | 13.63 M ops/s | 13.95 M ops/s | 73 ns | 72 ns | 0.98× | twMerge |
| long-list | 1.56 M ops/s | 1.57 M ops/s | 640 ns | 638 ns | 1.00× | twMerge |
| component-call | 8.33 M ops/s | 9.09 M ops/s | 120 ns | 110 ns | 0.92× | twMerge |
| arbitrary-heavy | 5.31 M ops/s | 5.17 M ops/s | 188 ns | 193 ns | 1.03× | cn.twMerge |
| cache-hit | 10.44 M ops/s | 8.63 M ops/s | 95 ns | 115 ns | 1.21× | cn.twMerge |
| cache-miss | 1.18 M ops/s | 765.3 k ops/s | 850 ns | 1.31 µs | 1.54× | cn.twMerge |
| component-call-fresh | 7.59 M ops/s | 6.74 M ops/s | 132 ns | 148 ns | 1.13× | cn.twMerge |
| working-set | 6.45 M ops/s | 7.06 M ops/s | 155 ns | 142 ns | 0.91× | twMerge |

## 和宣传口径对齐的几行

- `component-call`：cn() 85.62 M ops/s / 12 ns，twMerge(clsx) 8.22 M ops/s / 122 ns，cn 相对倍数 10.41×。
- `component-call-fresh`：cn() 42.81 M ops/s / 23 ns，twMerge(clsx) 7.32 M ops/s / 137 ns，cn 相对倍数 5.85×。
- `cache-hit`：cn() 50.00 M ops/s / 20 ns，twMerge(clsx) 9.38 M ops/s / 107 ns，cn 相对倍数 5.33×。
- `working-set`：cn() 8.11 M ops/s / 123 ns，twMerge(clsx) 5.82 M ops/s / 172 ns，cn 相对倍数 1.39×。
- `cache-miss`：cn() 283.8 k ops/s / 3.52 µs，twMerge(clsx) 779.2 k ops/s / 1.28 µs，cn 相对倍数 0.36×。
- `long-list`：cn() 66.67 M ops/s / 15 ns，twMerge(clsx) 1.54 M ops/s / 647 ns，cn 相对倍数 43.17×。
- `arbitrary-heavy`：cn() 85.62 M ops/s / 12 ns，twMerge(clsx) 5.13 M ops/s / 195 ns，cn 相对倍数 16.70×。
- `last-wins`：cn() 33.33 M ops/s / 30 ns，twMerge(clsx) 6.82 M ops/s / 147 ns，cn 相对倍数 4.89×。

## 怎么读

- `component-call` 复用同一参数数组，最接近他们说的「组件每次 render 传入同一批字符串实例」。这条上 cn 应该明显更快。
- `component-call-fresh` 每次 `() => [base, variant, extra]` 新建数组。字符串字面量仍然 intern，但数组身份变了。若 30× 主要靠 argument identity / 序列预测，这里倍数会掉下来。
- `working-set` 在 64 组预先分配好的参数之间循环，对应「真实仓库的工作集」。
- `cache-miss` 每次拼新字符串，对应 SSR / 动态 class。whole-string cache 帮不上忙。
- `long-list` 参数引用稳定时，cn 可能把整次合并变成一次缓存命中，倍数会非常大；这测的是缓存，不是「合并 30 个 utility 的算法」。
- 每个受试者进程的第一条 case 冷启动包含引擎初始化。`tailwind-merge` 第一次建 trie 更贵，和他们「首调用 3.2 ms vs 0.4 ms」是同一类现象，但我们的绝对值会因为 harness 不同而变。

生成时间：2026-09-15T02:56:53.012Z

