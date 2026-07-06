# Tailwind CSS v4 插件性能 Benchmark

生成时间：2026-07-06T07:07:26.113Z

## 测试范围

本 benchmark 在同一份 Tailwind CSS v4 输入下，对比 `weapp-tailwindcss`、`@tailwindcss/postcss` 与 `@tailwindcss/vite` 的隔离生成耗时和完整 Vite build 耗时。官方 Tailwind 插件只在该隔离 fixture 中使用，不接入正常 demo 或生产构建配置。

## 运行环境

| 项目 | 值 |
| --- | --- |
| Node | v24.18.0 |
| pnpm | 11.9.0 |
| Platform | darwin arm64 25.5.0 |
| CPU | Apple M4 Max |
| weapp-tailwindcss | 5.1.9 |
| tailwindcss | 4.3.2 |
| @tailwindcss/postcss | 4.3.2 |
| @tailwindcss/vite | 4.3.2 |
| vite | 7.3.6 |

## 参数

| 项目 | 值 |
| --- | --- |
| 正式轮数 | 3 |
| 预热轮数 | 1 |
| 默认目标 class 数量 | 600 |
| 默认源码文件数量 | 12 |
| 大规模目标 class 数量 | 5000 |
| 大规模源码文件数量 | 48 |
| 是否包含大规模场景 | 是 |
| 是否包含 HMR 场景 | 是 |

## 场景

| 场景 | 目标 class 数量 | 源码文件数量 | 实际候选类数量 | HMR 候选类数量 |
| --- | --- | --- | --- | --- |
| 默认规模 | 600 | 12 | 600 | 32 |
| 大数量级选择器 | 5000 | 48 | 5000 | 250 |

## 详细解读

### 默认规模

- 全量生成核心最快的是 @tailwindcss/postcss 直接 PostCSS 处理，中位数 6.05ms，输出选择器数 674。
- 增量缓存命中路径中位数 0.10ms，追加候选类路径中位数 8.50ms；这两项只覆盖局部候选类更新，不和全量生成直接等价。
- Vite 构建最快的是 Vite 构建 + @tailwindcss/postcss，中位数 15.02ms，CSS 大小 42.1 KiB。
- Vite dev/HMR 最快的是 Vite dev/HMR + @tailwindcss/vite（10.75ms），最慢的是 Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp'（86.95ms），差距约 8.09x。
- RSS 峰值最高的是 Vite dev/HMR + weapp-tailwindcss/vite generator.target='web'，峰值 622.73 MiB，本 case RSS 增量 14.69 MiB。

### 大数量级选择器

- 全量生成核心最快的是 @tailwindcss/postcss 直接 PostCSS 处理，中位数 13.64ms，输出选择器数 5043。
- 增量缓存命中路径中位数 0.08ms，追加候选类路径中位数 5.94ms；这两项只覆盖局部候选类更新，不和全量生成直接等价。
- Vite 构建最快的是 Vite 构建 + @tailwindcss/postcss，中位数 18.20ms，CSS 大小 183.5 KiB。
- Vite dev/HMR 最快的是 Vite dev/HMR + @tailwindcss/vite（38.68ms），最慢的是 Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp'（3625.61ms），差距约 93.73x。
- RSS 峰值最高的是 Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp'，峰值 1368.63 MiB，本 case RSS 增量 -24.47 MiB。

### 规模放大观察

- 候选类数量从 600 增加到 5000，约 8.33x。
- weapp-tailwindcss 生成器 target=weapp scanSources=true：中位数从 20.95ms 到 123.39ms，放大约 5.89x；RSS 峰值从 428.41 MiB 到 704.91 MiB。
- weapp-tailwindcss 生成器 target=web scanSources=true：中位数从 8.55ms 到 56.95ms，放大约 6.66x；RSS 峰值从 435.06 MiB 到 713.44 MiB。
- @tailwindcss/postcss 直接 PostCSS 处理：中位数从 6.05ms 到 13.64ms，放大约 2.25x；RSS 峰值从 461.66 MiB 到 748.11 MiB。
- Vite 构建 + weapp-tailwindcss/vite generator.target='weapp'：中位数从 31.51ms 到 194.14ms，放大约 6.16x；RSS 峰值从 537.67 MiB 到 937.20 MiB。
- Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp'：中位数从 86.95ms 到 3625.61ms，放大约 41.70x；RSS 峰值从 608.05 MiB 到 1368.63 MiB。

## 默认规模

### 生成核心

中位数最快：weapp-tailwindcss 生成器 incrementalCache cold（0.05ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| weapp-tailwindcss 生成器 target=weapp scanSources=true | weapp-tailwindcss/generator | 20.46ms | 20.95ms | 21.47ms | 27.6 KiB | 601 | 569 |
| weapp-tailwindcss 生成器 target=web scanSources=true | weapp-tailwindcss/generator | 8.76ms | 8.55ms | 9.45ms | 41.4 KiB | 601 | 667 |
| weapp-tailwindcss 生成器 target=weapp scanSources=false candidates | weapp-tailwindcss/generator | 15.63ms | 15.70ms | 16.35ms | 27.5 KiB | 600 | 568 |
| weapp-tailwindcss 生成器 target=web scanSources=false candidates | weapp-tailwindcss/generator | 6.98ms | 6.63ms | 8.03ms | 41.3 KiB | 600 | 666 |
| weapp-tailwindcss 生成器 incrementalCache cold | weapp-tailwindcss/generator | 0.07ms | 0.05ms | 0.10ms | 4.8 KiB | 96 | 95 |
| weapp-tailwindcss 生成器 incrementalCache hit | weapp-tailwindcss/generator | 0.10ms | 0.10ms | 0.10ms | 4.8 KiB | 96 | 95 |
| weapp-tailwindcss 生成器 incrementalCache append | weapp-tailwindcss/generator | 8.82ms | 8.50ms | 11.99ms | 6.1 KiB | 120 | 121 |
| @tailwindcss/postcss 直接 PostCSS 处理 | @tailwindcss/postcss | 6.51ms | 6.05ms | 7.48ms | 42.1 KiB | - | 674 |

### Vite 构建

中位数最快：Vite 构建 + @tailwindcss/postcss（15.02ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vite 构建 + @tailwindcss/postcss | @tailwindcss/postcss | 15.85ms | 15.02ms | 18.34ms | 42.1 KiB | - | 674 |
| Vite 构建 + @tailwindcss/vite | @tailwindcss/vite | 18.05ms | 17.64ms | 19.13ms | 40.7 KiB | - | 680 |
| Vite 构建 + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | 31.80ms | 31.51ms | 33.18ms | 27.1 KiB | - | 568 |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 32.33ms | 32.81ms | 33.24ms | 41.3 KiB | - | 667 |

### Vite dev/HMR

中位数最快：Vite dev/HMR + @tailwindcss/vite（10.75ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vite dev/HMR + @tailwindcss/postcss | @tailwindcss/postcss | 16.18ms | 15.61ms | 17.93ms | 46.4 KiB | - | 676 |
| Vite dev/HMR + @tailwindcss/vite | @tailwindcss/vite | 12.16ms | 10.75ms | 15.12ms | 45.5 KiB | - | 669 |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | 86.70ms | 86.95ms | 88.11ms | 29.5 KiB | - | 569 |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 31.85ms | 32.00ms | 32.13ms | 41.1 KiB | - | 642 |

### 内存占用

| 场景 | 用例 | 插件 | 模式 | RSS 峰值 | RSS 增量 | Heap 峰值 | Heap 增量 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 默认规模 | weapp-tailwindcss 生成器 target=weapp scanSources=true | weapp-tailwindcss/generator | generator | 428.41 MiB | 49.48 MiB | 211.43 MiB | 12.32 MiB |
| 默认规模 | weapp-tailwindcss 生成器 target=web scanSources=true | weapp-tailwindcss/generator | generator | 435.06 MiB | 6.66 MiB | 219.23 MiB | 16.97 MiB |
| 默认规模 | weapp-tailwindcss 生成器 target=weapp scanSources=false candidates | weapp-tailwindcss/generator | generator | 448.86 MiB | 13.80 MiB | 215.05 MiB | 29.12 MiB |
| 默认规模 | weapp-tailwindcss 生成器 target=web scanSources=false candidates | weapp-tailwindcss/generator | generator | 454.64 MiB | 5.78 MiB | 242.97 MiB | 165.3 KiB |
| 默认规模 | weapp-tailwindcss 生成器 incrementalCache cold | weapp-tailwindcss/generator | generator | 455.42 MiB | 800.0 KiB | 242.42 MiB | 26.84 MiB |
| 默认规模 | weapp-tailwindcss 生成器 incrementalCache hit | weapp-tailwindcss/generator | generator | 455.42 MiB | 0 B | 243.30 MiB | 1.16 MiB |
| 默认规模 | weapp-tailwindcss 生成器 incrementalCache append | weapp-tailwindcss/generator | generator | 461.22 MiB | 4.30 MiB | 245.75 MiB | -122.08 MiB |
| 默认规模 | @tailwindcss/postcss 直接 PostCSS 处理 | @tailwindcss/postcss | generator | 461.66 MiB | 1.94 MiB | 145.93 MiB | 24.70 MiB |
| 默认规模 | Vite 构建 + @tailwindcss/postcss | @tailwindcss/postcss | vite-build | 492.69 MiB | 24.47 MiB | 190.03 MiB | 37.88 MiB |
| 默认规模 | Vite 构建 + @tailwindcss/vite | @tailwindcss/vite | vite-build | 495.81 MiB | 9.69 MiB | 210.44 MiB | 11.36 MiB |
| 默认规模 | Vite 构建 + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | vite-build | 537.67 MiB | 41.86 MiB | 286.76 MiB | 65.43 MiB |
| 默认规模 | Vite 构建 + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | vite-build | 545.66 MiB | 7.98 MiB | 300.12 MiB | 33.66 MiB |
| 默认规模 | Vite dev/HMR + @tailwindcss/postcss | @tailwindcss/postcss | vite-hmr | 555.97 MiB | 10.31 MiB | 312.69 MiB | -5.71 MiB |
| 默认规模 | Vite dev/HMR + @tailwindcss/vite | @tailwindcss/vite | vite-hmr | 570.58 MiB | 14.56 MiB | 322.59 MiB | 16.14 MiB |
| 默认规模 | Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | vite-hmr | 608.05 MiB | 37.47 MiB | 367.01 MiB | 62.18 MiB |
| 默认规模 | Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | vite-hmr | 622.73 MiB | 14.69 MiB | 367.05 MiB | -24.61 MiB |

## 大数量级选择器

### 生成核心

中位数最快：weapp-tailwindcss 生成器 incrementalCache cold（0.04ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| weapp-tailwindcss 生成器 target=weapp scanSources=true | weapp-tailwindcss/generator | 128.68ms | 123.39ms | 145.90ms | 197.8 KiB | 5000 | 4689 |
| weapp-tailwindcss 生成器 target=web scanSources=true | weapp-tailwindcss/generator | 57.39ms | 56.95ms | 58.54ms | 273.2 KiB | 5000 | 5066 |
| weapp-tailwindcss 生成器 target=weapp scanSources=false candidates | weapp-tailwindcss/generator | 141.09ms | 139.43ms | 145.82ms | 197.8 KiB | 5000 | 4689 |
| weapp-tailwindcss 生成器 target=web scanSources=false candidates | weapp-tailwindcss/generator | 86.14ms | 86.55ms | 88.87ms | 273.2 KiB | 5000 | 5066 |
| weapp-tailwindcss 生成器 incrementalCache cold | weapp-tailwindcss/generator | 0.05ms | 0.04ms | 0.07ms | 4.8 KiB | 96 | 95 |
| weapp-tailwindcss 生成器 incrementalCache hit | weapp-tailwindcss/generator | 0.08ms | 0.08ms | 0.08ms | 4.8 KiB | 96 | 95 |
| weapp-tailwindcss 生成器 incrementalCache append | weapp-tailwindcss/generator | 6.60ms | 5.94ms | 8.07ms | 6.1 KiB | 120 | 121 |
| @tailwindcss/postcss 直接 PostCSS 处理 | @tailwindcss/postcss | 12.40ms | 13.64ms | 15.28ms | 183.5 KiB | - | 5043 |

### Vite 构建

中位数最快：Vite 构建 + @tailwindcss/postcss（18.20ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vite 构建 + @tailwindcss/postcss | @tailwindcss/postcss | 18.69ms | 18.20ms | 19.92ms | 183.5 KiB | - | 5043 |
| Vite 构建 + @tailwindcss/vite | @tailwindcss/vite | 65.39ms | 65.22ms | 66.82ms | 262.6 KiB | - | 5079 |
| Vite 构建 + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | 195.82ms | 194.14ms | 199.25ms | 197.3 KiB | - | 4688 |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 205.79ms | 205.50ms | 207.71ms | 273.1 KiB | - | 5066 |

### Vite dev/HMR

中位数最快：Vite dev/HMR + @tailwindcss/vite（38.68ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vite dev/HMR + @tailwindcss/postcss | @tailwindcss/postcss | 74.78ms | 73.38ms | 78.23ms | 194.6 KiB | - | 5045 |
| Vite dev/HMR + @tailwindcss/vite | @tailwindcss/vite | 38.19ms | 38.68ms | 39.18ms | 300.9 KiB | - | 5069 |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | 3605.76ms | 3625.61ms | 3636.98ms | 211.8 KiB | - | 4690 |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 234.08ms | 230.23ms | 245.26ms | 282.4 KiB | - | 5042 |

### 内存占用

| 场景 | 用例 | 插件 | 模式 | RSS 峰值 | RSS 增量 | Heap 峰值 | Heap 增量 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 大数量级选择器 | weapp-tailwindcss 生成器 target=weapp scanSources=true | weapp-tailwindcss/generator | generator | 704.91 MiB | 81.73 MiB | 421.28 MiB | -67.36 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 target=web scanSources=true | weapp-tailwindcss/generator | generator | 713.44 MiB | 8.53 MiB | 336.41 MiB | 54.90 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 target=weapp scanSources=false candidates | weapp-tailwindcss/generator | generator | 727.52 MiB | 14.08 MiB | 401.40 MiB | 43.01 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 target=web scanSources=false candidates | weapp-tailwindcss/generator | generator | 735.36 MiB | 7.84 MiB | 447.50 MiB | 67.42 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 incrementalCache cold | weapp-tailwindcss/generator | generator | 735.36 MiB | 0 B | 458.18 MiB | 10.34 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 incrementalCache hit | weapp-tailwindcss/generator | generator | 735.36 MiB | 0 B | 459.34 MiB | 1.16 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 incrementalCache append | weapp-tailwindcss/generator | generator | 735.36 MiB | -1.16 MiB | 460.35 MiB | -17.85 MiB |
| 大数量级选择器 | @tailwindcss/postcss 直接 PostCSS 处理 | @tailwindcss/postcss | generator | 748.11 MiB | 13.91 MiB | 480.13 MiB | 8.97 MiB |
| 大数量级选择器 | Vite 构建 + @tailwindcss/postcss | @tailwindcss/postcss | vite-build | 757.31 MiB | 9.20 MiB | 468.02 MiB | 17.54 MiB |
| 大数量级选择器 | Vite 构建 + @tailwindcss/vite | @tailwindcss/vite | vite-build | 811.34 MiB | 54.03 MiB | 492.25 MiB | 24.23 MiB |
| 大数量级选择器 | Vite 构建 + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | vite-build | 937.20 MiB | 125.86 MiB | 652.82 MiB | 160.57 MiB |
| 大数量级选择器 | Vite 构建 + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | vite-build | 1021.63 MiB | 84.42 MiB | 736.87 MiB | 84.04 MiB |
| 大数量级选择器 | Vite dev/HMR + @tailwindcss/postcss | @tailwindcss/postcss | vite-hmr | 1125.67 MiB | 104.05 MiB | 835.56 MiB | 98.69 MiB |
| 大数量级选择器 | Vite dev/HMR + @tailwindcss/vite | @tailwindcss/vite | vite-hmr | 1261.41 MiB | 47.23 MiB | 953.71 MiB | 91.45 MiB |
| 大数量级选择器 | Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | vite-hmr | 1368.63 MiB | -24.47 MiB | 1031.67 MiB | -292.38 MiB |
| 大数量级选择器 | Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | vite-hmr | 1286.41 MiB | -13.38 MiB | 718.88 MiB | -26.05 MiB |


## 结果解读

- “生成核心”用例隔离 CSS 生成成本，更适合对比插件的生成性能。
- “Vite 构建”用例包含 bundler 启动、Rollup 输出和插件集成开销，可作为端到端参考。
- “Vite dev/HMR”用例统计 Vite dev server 已启动后，临时源码文件写入、watcher change、module graph invalidation 与重新请求 CSS transform 的耗时；不包含浏览器 WebSocket 传输和页面应用样式的耗时。
- “大数量级选择器”场景用于观察 selector 数量上升后的生成、构建与 HMR 变化。
- 内存数据来自同一 Node 进程的 `process.memoryUsage()`，记录每个 case 的执行前后值、采样峰值和增量；RSS 增量会受 V8 GC 与前序 case 缓存影响，RSS 峰值更适合判断占用上界。
- `weapp` target 包含小程序选择器和 CSS 兼容转换；`web` target 保留浏览器 CSS 形态。
