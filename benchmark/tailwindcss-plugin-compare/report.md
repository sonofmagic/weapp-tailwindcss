# Tailwind CSS v4 插件性能 Benchmark

生成时间：2026-07-06T11:26:02.351Z

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

- 全量生成核心最快的是 weapp-tailwindcss 生成器 target=web scanSources=false candidates，中位数 6.58ms，输出选择器数 666。
- 增量缓存命中路径中位数 0.10ms，追加候选类路径中位数 6.04ms；这两项只覆盖局部候选类更新，不和全量生成直接等价。
- Vite 构建最快的是 Vite 构建 + @tailwindcss/postcss，中位数 14.39ms，CSS 大小 42.1 KiB。
- Vite dev/HMR 最快的是 Vite dev/HMR + @tailwindcss/vite（11.67ms），最慢的是 Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp'（89.61ms），差距约 7.68x。
- RSS 峰值最高的是 Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact，峰值 677.94 MiB，本 case RSS 增量 14.55 MiB。

### 大数量级选择器

- 全量生成核心最快的是 @tailwindcss/postcss 直接 PostCSS 处理，中位数 10.36ms，输出选择器数 5043。
- 增量缓存命中路径中位数 0.08ms，追加候选类路径中位数 5.23ms；这两项只覆盖局部候选类更新，不和全量生成直接等价。
- Vite 构建最快的是 Vite 构建 + @tailwindcss/postcss，中位数 18.36ms，CSS 大小 183.5 KiB。
- Vite dev/HMR 最快的是 Vite dev/HMR + @tailwindcss/vite（39.01ms），最慢的是 Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp'（3567.74ms），差距约 91.45x。
- RSS 峰值最高的是 Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp'，峰值 1343.44 MiB，本 case RSS 增量 10.97 MiB。

### 规模放大观察

- 候选类数量从 600 增加到 5000，约 8.33x。
- weapp-tailwindcss 生成器 target=weapp scanSources=true：中位数从 23.99ms 到 117.67ms，放大约 4.91x；RSS 峰值从 365.52 MiB 到 739.48 MiB。
- weapp-tailwindcss 生成器 target=web scanSources=true：中位数从 8.98ms 到 57.06ms，放大约 6.36x；RSS 峰值从 370.55 MiB 到 746.73 MiB。
- @tailwindcss/postcss 直接 PostCSS 处理：中位数从 7.26ms 到 10.36ms，放大约 1.43x；RSS 峰值从 404.94 MiB 到 751.84 MiB。
- Vite 构建 + weapp-tailwindcss/vite generator.target='weapp'：中位数从 34.34ms 到 195.10ms，放大约 5.68x；RSS 峰值从 570.92 MiB 到 827.17 MiB。
- Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp'：中位数从 89.61ms 到 3567.74ms，放大约 39.82x；RSS 峰值从 652.70 MiB 到 1343.44 MiB。

## Web target 与官方插件对比

`weapp-tailwindcss/vite generator.target='web'` 用来观察浏览器 Web 输出路径；`web-compact` 在本报告中固定为 `generator.target='web', webCompat=true`，用于观察 legacy WebView 兼容降级后的耗时、产物体积、选择器数量和内存变化。

对比基线包含 `@tailwindcss/postcss` 与 `@tailwindcss/vite`。表格里的“相对 @tailwindcss/vite”和“相对 @tailwindcss/postcss”均以中位数耗时计算；低于 `1.00x` 表示更快，高于 `1.00x` 表示更慢。

### 默认规模

#### Vite 构建

- Vite 构建：中位数最快的是 Vite 构建 + @tailwindcss/postcss，为 14.39ms。
- Vite 构建：web-compact 相对普通 web 的耗时比例为 0.91x，CSS 大小变化 -10.3%，RSS 峰值变化 +1.6%。

| 用例 | 插件 | 中位数 | 相对 @tailwindcss/vite | 相对 @tailwindcss/postcss | CSS 大小 | CSS 体积相对 vite | 选择器数 | RSS 峰值 | RSS 增量 | Heap 峰值 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Vite 构建 + @tailwindcss/postcss | @tailwindcss/postcss | 14.39ms | 0.76x | 1.00x | 42.1 KiB | +3.6% | 674 | 474.08 MiB | 69.14 MiB | 242.75 MiB |
| Vite 构建 + @tailwindcss/vite | @tailwindcss/vite | 18.93ms | 1.00x | 1.32x | 40.7 KiB | +0.0% | 680 | 494.98 MiB | 20.91 MiB | 256.24 MiB |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 35.88ms | 1.89x | 2.49x | 41.3 KiB | +1.6% | 667 | 578.56 MiB | 7.64 MiB | 347.33 MiB |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 32.67ms | 1.73x | 2.27x | 37.0 KiB | -8.9% | 640 | 587.88 MiB | 9.31 MiB | 354.28 MiB |

#### Vite dev/HMR

- Vite dev/HMR：中位数最快的是 Vite dev/HMR + @tailwindcss/vite，为 11.67ms。
- Vite dev/HMR：web-compact 相对普通 web 的耗时比例为 1.36x，CSS 大小变化 -10.1%，RSS 峰值变化 +2.2%。

| 用例 | 插件 | 中位数 | 相对 @tailwindcss/vite | 相对 @tailwindcss/postcss | CSS 大小 | CSS 体积相对 vite | 选择器数 | RSS 峰值 | RSS 增量 | Heap 峰值 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Vite dev/HMR + @tailwindcss/postcss | @tailwindcss/postcss | 15.57ms | 1.33x | 1.00x | 46.4 KiB | +1.9% | 676 | 593.42 MiB | 5.55 MiB | 368.96 MiB |
| Vite dev/HMR + @tailwindcss/vite | @tailwindcss/vite | 11.67ms | 1.00x | 0.75x | 45.5 KiB | +0.0% | 669 | 608.94 MiB | 15.44 MiB | 378.06 MiB |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 15.95ms | 1.37x | 1.02x | 45.7 KiB | +0.3% | 669 | 663.39 MiB | 10.67 MiB | 433.67 MiB |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 21.68ms | 1.86x | 1.39x | 41.1 KiB | -9.8% | 642 | 677.94 MiB | 14.55 MiB | 435.05 MiB |

### 大数量级选择器

#### Vite 构建

- Vite 构建：中位数最快的是 Vite 构建 + @tailwindcss/postcss，为 18.36ms。
- Vite 构建：web-compact 相对普通 web 的耗时比例为 1.00x，CSS 大小变化 -6.5%，RSS 峰值变化 +8.7%。

| 用例 | 插件 | 中位数 | 相对 @tailwindcss/vite | 相对 @tailwindcss/postcss | CSS 大小 | CSS 体积相对 vite | 选择器数 | RSS 峰值 | RSS 增量 | Heap 峰值 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Vite 构建 + @tailwindcss/postcss | @tailwindcss/postcss | 18.36ms | 0.29x | 1.00x | 183.5 KiB | -30.1% | 5043 | 753.84 MiB | 2.00 MiB | 376.95 MiB |
| Vite 构建 + @tailwindcss/vite | @tailwindcss/vite | 62.72ms | 1.00x | 3.42x | 262.6 KiB | +0.0% | 5079 | 769.02 MiB | 15.17 MiB | 400.67 MiB |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 206.70ms | 3.30x | 11.26x | 273.1 KiB | +4.0% | 5066 | 906.06 MiB | 78.89 MiB | 641.14 MiB |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 205.69ms | 3.28x | 11.20x | 255.4 KiB | -2.8% | 5039 | 985.11 MiB | 79.05 MiB | 708.57 MiB |

#### Vite dev/HMR

- Vite dev/HMR：中位数最快的是 Vite dev/HMR + @tailwindcss/vite，为 39.01ms。
- Vite dev/HMR：web-compact 相对普通 web 的耗时比例为 1.41x，CSS 大小变化 -6.2%，RSS 峰值变化 +1.3%。

| 用例 | 插件 | 中位数 | 相对 @tailwindcss/vite | 相对 @tailwindcss/postcss | CSS 大小 | CSS 体积相对 vite | 选择器数 | RSS 峰值 | RSS 增量 | Heap 峰值 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Vite dev/HMR + @tailwindcss/postcss | @tailwindcss/postcss | 79.56ms | 2.04x | 1.00x | 194.6 KiB | -35.3% | 5045 | 1085.44 MiB | 100.33 MiB | 788.03 MiB |
| Vite dev/HMR + @tailwindcss/vite | @tailwindcss/vite | 39.01ms | 1.00x | 0.49x | 300.9 KiB | +0.0% | 5069 | 1217.53 MiB | 41.83 MiB | 933.47 MiB |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 118.59ms | 3.04x | 1.49x | 301.1 KiB | +0.1% | 5069 | 1271.58 MiB | -5.23 MiB | 697.32 MiB |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 166.95ms | 4.28x | 2.10x | 282.4 KiB | -6.1% | 5042 | 1288.31 MiB | 32.17 MiB | 748.99 MiB |

## 默认规模

### 生成核心

中位数最快：weapp-tailwindcss 生成器 incrementalCache cold（0.08ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| weapp-tailwindcss 生成器 target=weapp scanSources=true | weapp-tailwindcss/generator | 25.05ms | 23.99ms | 31.90ms | 27.6 KiB | 601 | 569 |
| weapp-tailwindcss 生成器 target=web scanSources=true | weapp-tailwindcss/generator | 9.35ms | 8.98ms | 10.23ms | 41.4 KiB | 601 | 667 |
| weapp-tailwindcss 生成器 target=weapp scanSources=false candidates | weapp-tailwindcss/generator | 15.74ms | 15.84ms | 15.98ms | 27.5 KiB | 600 | 568 |
| weapp-tailwindcss 生成器 target=web scanSources=false candidates | weapp-tailwindcss/generator | 6.92ms | 6.58ms | 7.78ms | 41.3 KiB | 600 | 666 |
| weapp-tailwindcss 生成器 incrementalCache cold | weapp-tailwindcss/generator | 0.08ms | 0.08ms | 0.09ms | 4.8 KiB | 96 | 95 |
| weapp-tailwindcss 生成器 incrementalCache hit | weapp-tailwindcss/generator | 0.10ms | 0.10ms | 0.10ms | 4.8 KiB | 96 | 95 |
| weapp-tailwindcss 生成器 incrementalCache append | weapp-tailwindcss/generator | 6.45ms | 6.04ms | 7.28ms | 6.2 KiB | 120 | 122 |
| @tailwindcss/postcss 直接 PostCSS 处理 | @tailwindcss/postcss | 6.81ms | 7.26ms | 7.35ms | 42.1 KiB | - | 674 |

### Vite 构建

中位数最快：Vite 构建 + @tailwindcss/postcss（14.39ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vite 构建 + @tailwindcss/postcss | @tailwindcss/postcss | 14.60ms | 14.39ms | 15.90ms | 42.1 KiB | - | 674 |
| Vite 构建 + @tailwindcss/vite | @tailwindcss/vite | 19.28ms | 18.93ms | 20.72ms | 40.7 KiB | - | 680 |
| Vite 构建 + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | 34.36ms | 34.34ms | 36.66ms | 27.3 KiB | - | 568 |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 35.50ms | 35.88ms | 36.73ms | 41.3 KiB | - | 667 |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 33.19ms | 32.67ms | 34.54ms | 37.0 KiB | - | 640 |

### Vite dev/HMR

中位数最快：Vite dev/HMR + @tailwindcss/vite（11.67ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vite dev/HMR + @tailwindcss/postcss | @tailwindcss/postcss | 16.34ms | 15.57ms | 18.27ms | 46.4 KiB | - | 676 |
| Vite dev/HMR + @tailwindcss/vite | @tailwindcss/vite | 11.51ms | 11.67ms | 11.78ms | 45.5 KiB | - | 669 |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | 89.73ms | 89.61ms | 91.35ms | 29.7 KiB | - | 569 |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 15.21ms | 15.95ms | 16.01ms | 45.7 KiB | - | 669 |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 22.29ms | 21.68ms | 24.34ms | 41.1 KiB | - | 642 |

### 内存占用

| 场景 | 用例 | 插件 | 模式 | RSS 峰值 | RSS 增量 | Heap 峰值 | Heap 增量 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 默认规模 | weapp-tailwindcss 生成器 target=weapp scanSources=true | weapp-tailwindcss/generator | generator | 365.52 MiB | 39.06 MiB | 145.45 MiB | -1.86 MiB |
| 默认规模 | weapp-tailwindcss 生成器 target=web scanSources=true | weapp-tailwindcss/generator | generator | 370.55 MiB | 5.03 MiB | 169.51 MiB | 19.87 MiB |
| 默认规模 | weapp-tailwindcss 生成器 target=weapp scanSources=false candidates | weapp-tailwindcss/generator | generator | 390.69 MiB | 20.14 MiB | 169.37 MiB | 30.27 MiB |
| 默认规模 | weapp-tailwindcss 生成器 target=web scanSources=false candidates | weapp-tailwindcss/generator | generator | 395.94 MiB | 5.25 MiB | 183.39 MiB | -160.5 KiB |
| 默认规模 | weapp-tailwindcss 生成器 incrementalCache cold | weapp-tailwindcss/generator | generator | 396.59 MiB | 672.0 KiB | 196.27 MiB | 26.94 MiB |
| 默认规模 | weapp-tailwindcss 生成器 incrementalCache hit | weapp-tailwindcss/generator | generator | 396.61 MiB | 16.0 KiB | 197.41 MiB | 1.17 MiB |
| 默认规模 | weapp-tailwindcss 生成器 incrementalCache append | weapp-tailwindcss/generator | generator | 401.86 MiB | 5.25 MiB | 199.99 MiB | -17.93 MiB |
| 默认规模 | @tailwindcss/postcss 直接 PostCSS 处理 | @tailwindcss/postcss | generator | 404.94 MiB | 3.08 MiB | 204.07 MiB | 24.57 MiB |
| 默认规模 | Vite 构建 + @tailwindcss/postcss | @tailwindcss/postcss | vite-build | 474.08 MiB | 69.14 MiB | 242.75 MiB | 38.67 MiB |
| 默认规模 | Vite 构建 + @tailwindcss/vite | @tailwindcss/vite | vite-build | 494.98 MiB | 20.91 MiB | 256.24 MiB | 10.08 MiB |
| 默认规模 | Vite 构建 + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | vite-build | 570.92 MiB | 75.94 MiB | 337.25 MiB | 80.84 MiB |
| 默认规模 | Vite 构建 + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | vite-build | 578.56 MiB | 7.64 MiB | 347.33 MiB | 13.35 MiB |
| 默认规模 | Vite 构建 + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | vite-build | 587.88 MiB | 9.31 MiB | 354.28 MiB | -33.36 MiB |
| 默认规模 | Vite dev/HMR + @tailwindcss/postcss | @tailwindcss/postcss | vite-hmr | 593.42 MiB | 5.55 MiB | 368.96 MiB | 44.86 MiB |
| 默认规模 | Vite dev/HMR + @tailwindcss/vite | @tailwindcss/vite | vite-hmr | 608.94 MiB | 15.44 MiB | 378.06 MiB | 19.16 MiB |
| 默认规模 | Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | vite-hmr | 652.70 MiB | 43.77 MiB | 417.25 MiB | 39.16 MiB |
| 默认规模 | Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | vite-hmr | 663.39 MiB | 10.67 MiB | 433.67 MiB | -12.89 MiB |
| 默认规模 | Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | vite-hmr | 677.94 MiB | 14.55 MiB | 435.05 MiB | 7.30 MiB |

## 大数量级选择器

### 生成核心

中位数最快：weapp-tailwindcss 生成器 incrementalCache cold（0.05ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| weapp-tailwindcss 生成器 target=weapp scanSources=true | weapp-tailwindcss/generator | 127.71ms | 117.67ms | 149.84ms | 197.8 KiB | 5000 | 4689 |
| weapp-tailwindcss 生成器 target=web scanSources=true | weapp-tailwindcss/generator | 57.88ms | 57.06ms | 59.54ms | 273.2 KiB | 5000 | 5066 |
| weapp-tailwindcss 生成器 target=weapp scanSources=false candidates | weapp-tailwindcss/generator | 157.80ms | 160.43ms | 163.01ms | 197.8 KiB | 5000 | 4689 |
| weapp-tailwindcss 生成器 target=web scanSources=false candidates | weapp-tailwindcss/generator | 83.28ms | 81.13ms | 88.53ms | 273.2 KiB | 5000 | 5066 |
| weapp-tailwindcss 生成器 incrementalCache cold | weapp-tailwindcss/generator | 0.05ms | 0.05ms | 0.06ms | 4.8 KiB | 96 | 95 |
| weapp-tailwindcss 生成器 incrementalCache hit | weapp-tailwindcss/generator | 0.08ms | 0.08ms | 0.08ms | 4.8 KiB | 96 | 95 |
| weapp-tailwindcss 生成器 incrementalCache append | weapp-tailwindcss/generator | 5.68ms | 5.23ms | 6.59ms | 6.2 KiB | 120 | 122 |
| @tailwindcss/postcss 直接 PostCSS 处理 | @tailwindcss/postcss | 11.98ms | 10.36ms | 16.40ms | 183.5 KiB | - | 5043 |

### Vite 构建

中位数最快：Vite 构建 + @tailwindcss/postcss（18.36ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vite 构建 + @tailwindcss/postcss | @tailwindcss/postcss | 19.05ms | 18.36ms | 20.69ms | 183.5 KiB | - | 5043 |
| Vite 构建 + @tailwindcss/vite | @tailwindcss/vite | 62.89ms | 62.72ms | 64.25ms | 262.6 KiB | - | 5079 |
| Vite 构建 + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | 194.27ms | 195.10ms | 196.72ms | 197.5 KiB | - | 4688 |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 205.59ms | 206.70ms | 208.30ms | 273.1 KiB | - | 5066 |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 204.94ms | 205.69ms | 206.50ms | 255.4 KiB | - | 5039 |

### Vite dev/HMR

中位数最快：Vite dev/HMR + @tailwindcss/vite（39.01ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vite dev/HMR + @tailwindcss/postcss | @tailwindcss/postcss | 77.36ms | 79.56ms | 79.59ms | 194.6 KiB | - | 5045 |
| Vite dev/HMR + @tailwindcss/vite | @tailwindcss/vite | 39.28ms | 39.01ms | 40.01ms | 300.9 KiB | - | 5069 |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | 3564.86ms | 3567.74ms | 3601.80ms | 212.1 KiB | - | 4690 |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 118.32ms | 118.59ms | 121.17ms | 301.1 KiB | - | 5069 |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 167.28ms | 166.95ms | 168.59ms | 282.4 KiB | - | 5042 |

### 内存占用

| 场景 | 用例 | 插件 | 模式 | RSS 峰值 | RSS 增量 | Heap 峰值 | Heap 增量 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 大数量级选择器 | weapp-tailwindcss 生成器 target=weapp scanSources=true | weapp-tailwindcss/generator | generator | 739.48 MiB | 61.11 MiB | 492.57 MiB | -71.14 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 target=web scanSources=true | weapp-tailwindcss/generator | generator | 746.73 MiB | 7.25 MiB | 375.87 MiB | 16.12 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 target=weapp scanSources=false candidates | weapp-tailwindcss/generator | generator | 750.89 MiB | -13.94 MiB | 400.42 MiB | -63.14 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 target=web scanSources=false candidates | weapp-tailwindcss/generator | generator | 739.30 MiB | 6.50 MiB | 361.96 MiB | 60.21 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 incrementalCache cold | weapp-tailwindcss/generator | generator | 739.30 MiB | 0 B | 372.74 MiB | 10.45 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 incrementalCache hit | weapp-tailwindcss/generator | generator | 739.30 MiB | 0 B | 373.89 MiB | 1.15 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 incrementalCache append | weapp-tailwindcss/generator | generator | 739.30 MiB | -1.16 MiB | 374.93 MiB | -21.29 MiB |
| 大数量级选择器 | @tailwindcss/postcss 直接 PostCSS 处理 | @tailwindcss/postcss | generator | 751.84 MiB | 13.70 MiB | 383.61 MiB | 9.83 MiB |
| 大数量级选择器 | Vite 构建 + @tailwindcss/postcss | @tailwindcss/postcss | vite-build | 753.84 MiB | 2.00 MiB | 376.95 MiB | 13.97 MiB |
| 大数量级选择器 | Vite 构建 + @tailwindcss/vite | @tailwindcss/vite | vite-build | 769.02 MiB | 15.17 MiB | 400.67 MiB | 24.25 MiB |
| 大数量级选择器 | Vite 构建 + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | vite-build | 827.17 MiB | 58.16 MiB | 545.15 MiB | 115.18 MiB |
| 大数量级选择器 | Vite 构建 + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | vite-build | 906.06 MiB | 78.89 MiB | 641.14 MiB | 125.29 MiB |
| 大数量级选择器 | Vite 构建 + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | vite-build | 985.11 MiB | 79.05 MiB | 708.57 MiB | 42.35 MiB |
| 大数量级选择器 | Vite dev/HMR + @tailwindcss/postcss | @tailwindcss/postcss | vite-hmr | 1085.44 MiB | 100.33 MiB | 788.03 MiB | 104.54 MiB |
| 大数量级选择器 | Vite dev/HMR + @tailwindcss/vite | @tailwindcss/vite | vite-hmr | 1217.53 MiB | 41.83 MiB | 933.47 MiB | 69.62 MiB |
| 大数量级选择器 | Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | vite-hmr | 1343.44 MiB | 10.97 MiB | 1063.91 MiB | -231.07 MiB |
| 大数量级选择器 | Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | vite-hmr | 1271.58 MiB | -5.23 MiB | 697.32 MiB | -51.77 MiB |
| 大数量级选择器 | Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | vite-hmr | 1288.31 MiB | 32.17 MiB | 748.99 MiB | 109.49 MiB |


## 结果解读

- “生成核心”用例隔离 CSS 生成成本，更适合对比插件的生成性能。
- “Vite 构建”用例包含 bundler 启动、Rollup 输出和插件集成开销，可作为端到端参考。
- “Vite dev/HMR”用例统计 Vite dev server 已启动后，临时源码文件写入、watcher change、module graph invalidation 与重新请求 CSS transform 的耗时；不包含浏览器 WebSocket 传输和页面应用样式的耗时。
- “大数量级选择器”场景用于观察 selector 数量上升后的生成、构建与 HMR 变化。
- 内存数据来自同一 Node 进程的 `process.memoryUsage()`，记录每个 case 的执行前后值、采样峰值和增量；RSS 增量会受 V8 GC 与前序 case 缓存影响，RSS 峰值更适合判断占用上界。
- `weapp` target 包含小程序选择器和 CSS 兼容转换；`web` target 保留浏览器 CSS 形态；`web-compact` 表示 `target='web'` 且开启 `webCompat=true` 的 legacy WebView 兼容降级输出。
