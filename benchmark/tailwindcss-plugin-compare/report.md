# Tailwind CSS v4 插件性能 Benchmark

生成时间：2026-07-06T08:21:56.217Z

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

- 全量生成核心最快的是 @tailwindcss/postcss 直接 PostCSS 处理，中位数 5.89ms，输出选择器数 674。
- 增量缓存命中路径中位数 0.10ms，追加候选类路径中位数 6.49ms；这两项只覆盖局部候选类更新，不和全量生成直接等价。
- Vite 构建最快的是 Vite 构建 + @tailwindcss/postcss，中位数 19.29ms，CSS 大小 42.1 KiB。
- Vite dev/HMR 最快的是 Vite dev/HMR + @tailwindcss/vite（14.63ms），最慢的是 Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp'（99.49ms），差距约 6.80x。
- RSS 峰值最高的是 Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact，峰值 689.27 MiB，本 case RSS 增量 15.48 MiB。

### 大数量级选择器

- 全量生成核心最快的是 @tailwindcss/postcss 直接 PostCSS 处理，中位数 14.77ms，输出选择器数 5043。
- 增量缓存命中路径中位数 0.10ms，追加候选类路径中位数 8.06ms；这两项只覆盖局部候选类更新，不和全量生成直接等价。
- Vite 构建最快的是 Vite 构建 + @tailwindcss/postcss，中位数 46.00ms，CSS 大小 183.5 KiB。
- Vite dev/HMR 最快的是 Vite dev/HMR + @tailwindcss/vite（41.08ms），最慢的是 Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp'（4798.06ms），差距约 116.79x。
- RSS 峰值最高的是 Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact，峰值 1346.81 MiB，本 case RSS 增量 129.14 MiB。

### 规模放大观察

- 候选类数量从 600 增加到 5000，约 8.33x。
- weapp-tailwindcss 生成器 target=weapp scanSources=true：中位数从 21.38ms 到 154.36ms，放大约 7.22x；RSS 峰值从 448.41 MiB 到 775.13 MiB。
- weapp-tailwindcss 生成器 target=web scanSources=true：中位数从 9.21ms 到 71.30ms，放大约 7.74x；RSS 峰值从 453.70 MiB 到 782.88 MiB。
- @tailwindcss/postcss 直接 PostCSS 处理：中位数从 5.89ms 到 14.77ms，放大约 2.51x；RSS 峰值从 482.69 MiB 到 816.25 MiB。
- Vite 构建 + weapp-tailwindcss/vite generator.target='weapp'：中位数从 36.70ms 到 191.35ms，放大约 5.21x；RSS 峰值从 569.94 MiB 到 942.34 MiB。
- Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp'：中位数从 99.49ms 到 4798.06ms，放大约 48.23x；RSS 峰值从 660.63 MiB 到 1133.98 MiB。

## Web target 与官方插件对比

`weapp-tailwindcss/vite generator.target='web'` 用来观察浏览器 Web 输出路径；`web-compact` 在本报告中固定为 `generator.target='web', webCompat=true`，用于观察 legacy WebView 兼容降级后的耗时、产物体积、选择器数量和内存变化。

对比基线包含 `@tailwindcss/postcss` 与 `@tailwindcss/vite`。表格里的“相对 @tailwindcss/vite”和“相对 @tailwindcss/postcss”均以中位数耗时计算；低于 `1.00x` 表示更快，高于 `1.00x` 表示更慢。

### 默认规模

#### Vite 构建

- Vite 构建：中位数最快的是 Vite 构建 + @tailwindcss/postcss，为 19.29ms。
- Vite 构建：web-compact 相对普通 web 的耗时比例为 1.79x，CSS 大小变化 -10.3%，RSS 峰值变化 +3.4%。

| 用例 | 插件 | 中位数 | 相对 @tailwindcss/vite | 相对 @tailwindcss/postcss | CSS 大小 | CSS 体积相对 vite | 选择器数 | RSS 峰值 | RSS 增量 | Heap 峰值 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Vite 构建 + @tailwindcss/postcss | @tailwindcss/postcss | 19.29ms | 0.99x | 1.00x | 42.1 KiB | +3.6% | 674 | 516.42 MiB | 28.19 MiB | 223.54 MiB |
| Vite 构建 + @tailwindcss/vite | @tailwindcss/vite | 19.43ms | 1.00x | 1.01x | 40.7 KiB | +0.0% | 680 | 521.52 MiB | 10.64 MiB | 246.85 MiB |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 37.38ms | 1.92x | 1.94x | 41.3 KiB | +1.6% | 667 | 577.47 MiB | 7.53 MiB | 327.03 MiB |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 66.93ms | 3.45x | 3.47x | 37.0 KiB | -8.9% | 640 | 597.17 MiB | 19.70 MiB | 340.11 MiB |

#### Vite dev/HMR

- Vite dev/HMR：中位数最快的是 Vite dev/HMR + @tailwindcss/vite，为 14.63ms。
- Vite dev/HMR：web-compact 相对普通 web 的耗时比例为 1.15x，CSS 大小变化 +0.0%，RSS 峰值变化 +2.3%。

| 用例 | 插件 | 中位数 | 相对 @tailwindcss/vite | 相对 @tailwindcss/postcss | CSS 大小 | CSS 体积相对 vite | 选择器数 | RSS 峰值 | RSS 增量 | Heap 峰值 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Vite dev/HMR + @tailwindcss/postcss | @tailwindcss/postcss | 23.11ms | 1.58x | 1.00x | 46.4 KiB | +1.9% | 676 | 603.48 MiB | 6.31 MiB | 365.32 MiB |
| Vite dev/HMR + @tailwindcss/vite | @tailwindcss/vite | 14.63ms | 1.00x | 0.63x | 45.5 KiB | +0.0% | 669 | 626.45 MiB | 22.91 MiB | 369.41 MiB |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 32.77ms | 2.24x | 1.42x | 41.1 KiB | -9.8% | 642 | 673.78 MiB | 13.16 MiB | 425.33 MiB |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 37.67ms | 2.58x | 1.63x | 41.1 KiB | -9.8% | 642 | 689.27 MiB | 15.48 MiB | 447.21 MiB |

### 大数量级选择器

#### Vite 构建

- Vite 构建：中位数最快的是 Vite 构建 + @tailwindcss/postcss，为 46.00ms。
- Vite 构建：web-compact 相对普通 web 的耗时比例为 2.24x，CSS 大小变化 -6.5%，RSS 峰值变化 +13.6%。

| 用例 | 插件 | 中位数 | 相对 @tailwindcss/vite | 相对 @tailwindcss/postcss | CSS 大小 | CSS 体积相对 vite | 选择器数 | RSS 峰值 | RSS 增量 | Heap 峰值 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Vite 构建 + @tailwindcss/postcss | @tailwindcss/postcss | 46.00ms | 0.55x | 1.00x | 183.5 KiB | -30.1% | 5043 | 817.81 MiB | 1.56 MiB | 485.72 MiB |
| Vite 构建 + @tailwindcss/vite | @tailwindcss/vite | 83.05ms | 1.00x | 1.81x | 262.6 KiB | +0.0% | 5079 | 832.25 MiB | 14.44 MiB | 496.27 MiB |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 203.98ms | 2.46x | 4.43x | 273.1 KiB | +4.0% | 5066 | 1026.44 MiB | 84.09 MiB | 740.13 MiB |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 457.01ms | 5.50x | 9.94x | 255.4 KiB | -2.8% | 5039 | 1166.23 MiB | 16.86 MiB | 861.40 MiB |

#### Vite dev/HMR

- Vite dev/HMR：中位数最快的是 Vite dev/HMR + @tailwindcss/vite，为 41.08ms。
- Vite dev/HMR：web-compact 相对普通 web 的耗时比例为 1.19x，CSS 大小变化 +0.0%，RSS 峰值变化 +10.6%。

| 用例 | 插件 | 中位数 | 相对 @tailwindcss/vite | 相对 @tailwindcss/postcss | CSS 大小 | CSS 体积相对 vite | 选择器数 | RSS 峰值 | RSS 增量 | Heap 峰值 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Vite dev/HMR + @tailwindcss/postcss | @tailwindcss/postcss | 78.19ms | 1.90x | 1.00x | 194.6 KiB | -35.3% | 5045 | 1067.22 MiB | 23.92 MiB | 442.94 MiB |
| Vite dev/HMR + @tailwindcss/vite | @tailwindcss/vite | 41.08ms | 1.00x | 0.53x | 300.9 KiB | +0.0% | 5069 | 1089.11 MiB | 9.69 MiB | 569.55 MiB |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 224.10ms | 5.45x | 2.87x | 282.4 KiB | -6.1% | 5042 | 1217.64 MiB | 44.44 MiB | 912.06 MiB |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 265.68ms | 6.47x | 3.40x | 282.4 KiB | -6.1% | 5042 | 1346.81 MiB | 129.14 MiB | 1040.42 MiB |

## 默认规模

### 生成核心

中位数最快：weapp-tailwindcss 生成器 incrementalCache cold（0.06ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| weapp-tailwindcss 生成器 target=weapp scanSources=true | weapp-tailwindcss/generator | 20.88ms | 21.38ms | 22.72ms | 27.6 KiB | 601 | 569 |
| weapp-tailwindcss 生成器 target=web scanSources=true | weapp-tailwindcss/generator | 9.60ms | 9.21ms | 11.16ms | 41.4 KiB | 601 | 667 |
| weapp-tailwindcss 生成器 target=weapp scanSources=false candidates | weapp-tailwindcss/generator | 20.91ms | 21.15ms | 25.47ms | 27.5 KiB | 600 | 568 |
| weapp-tailwindcss 生成器 target=web scanSources=false candidates | weapp-tailwindcss/generator | 6.89ms | 7.12ms | 7.13ms | 41.3 KiB | 600 | 666 |
| weapp-tailwindcss 生成器 incrementalCache cold | weapp-tailwindcss/generator | 0.07ms | 0.06ms | 0.10ms | 4.8 KiB | 96 | 95 |
| weapp-tailwindcss 生成器 incrementalCache hit | weapp-tailwindcss/generator | 0.10ms | 0.10ms | 0.10ms | 4.8 KiB | 96 | 95 |
| weapp-tailwindcss 生成器 incrementalCache append | weapp-tailwindcss/generator | 6.70ms | 6.49ms | 7.60ms | 6.1 KiB | 120 | 121 |
| @tailwindcss/postcss 直接 PostCSS 处理 | @tailwindcss/postcss | 6.63ms | 5.89ms | 8.77ms | 42.1 KiB | - | 674 |

### Vite 构建

中位数最快：Vite 构建 + @tailwindcss/postcss（19.29ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vite 构建 + @tailwindcss/postcss | @tailwindcss/postcss | 18.26ms | 19.29ms | 19.85ms | 42.1 KiB | - | 674 |
| Vite 构建 + @tailwindcss/vite | @tailwindcss/vite | 19.62ms | 19.43ms | 20.53ms | 40.7 KiB | - | 680 |
| Vite 构建 + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | 38.43ms | 36.70ms | 43.74ms | 27.1 KiB | - | 568 |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 36.80ms | 37.38ms | 38.12ms | 41.3 KiB | - | 667 |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 66.86ms | 66.93ms | 69.16ms | 37.0 KiB | - | 640 |

### Vite dev/HMR

中位数最快：Vite dev/HMR + @tailwindcss/vite（14.63ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vite dev/HMR + @tailwindcss/postcss | @tailwindcss/postcss | 27.82ms | 23.11ms | 41.94ms | 46.4 KiB | - | 676 |
| Vite dev/HMR + @tailwindcss/vite | @tailwindcss/vite | 16.69ms | 14.63ms | 22.04ms | 45.5 KiB | - | 669 |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | 105.45ms | 99.49ms | 121.53ms | 29.5 KiB | - | 569 |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 32.91ms | 32.77ms | 34.13ms | 41.1 KiB | - | 642 |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 37.23ms | 37.67ms | 37.85ms | 41.1 KiB | - | 642 |

### 内存占用

| 场景 | 用例 | 插件 | 模式 | RSS 峰值 | RSS 增量 | Heap 峰值 | Heap 增量 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 默认规模 | weapp-tailwindcss 生成器 target=weapp scanSources=true | weapp-tailwindcss/generator | generator | 448.41 MiB | 49.42 MiB | 233.13 MiB | 36.55 MiB |
| 默认规模 | weapp-tailwindcss 生成器 target=web scanSources=true | weapp-tailwindcss/generator | generator | 453.70 MiB | 5.30 MiB | 239.30 MiB | 12.07 MiB |
| 默认规模 | weapp-tailwindcss 生成器 target=weapp scanSources=false candidates | weapp-tailwindcss/generator | generator | 482.25 MiB | 27.73 MiB | 273.57 MiB | -55.16 MiB |
| 默认规模 | weapp-tailwindcss 生成器 target=web scanSources=false candidates | weapp-tailwindcss/generator | generator | 481.61 MiB | 176.0 KiB | 174.92 MiB | -1.48 MiB |
| 默认规模 | weapp-tailwindcss 生成器 incrementalCache cold | weapp-tailwindcss/generator | generator | 481.69 MiB | 80.0 KiB | 173.48 MiB | -21.81 MiB |
| 默认规模 | weapp-tailwindcss 生成器 incrementalCache hit | weapp-tailwindcss/generator | generator | 481.69 MiB | 0 B | 152.85 MiB | 1.17 MiB |
| 默认规模 | weapp-tailwindcss 生成器 incrementalCache append | weapp-tailwindcss/generator | generator | 481.70 MiB | 16.0 KiB | 177.26 MiB | -11.86 MiB |
| 默认规模 | @tailwindcss/postcss 直接 PostCSS 处理 | @tailwindcss/postcss | generator | 482.69 MiB | 1008.0 KiB | 165.57 MiB | 24.56 MiB |
| 默认规模 | Vite 构建 + @tailwindcss/postcss | @tailwindcss/postcss | vite-build | 516.42 MiB | 28.19 MiB | 223.54 MiB | 41.85 MiB |
| 默认规模 | Vite 构建 + @tailwindcss/vite | @tailwindcss/vite | vite-build | 521.52 MiB | 10.64 MiB | 246.85 MiB | 15.75 MiB |
| 默认规模 | Vite 构建 + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | vite-build | 569.94 MiB | 48.42 MiB | 323.16 MiB | 52.43 MiB |
| 默认规模 | Vite 构建 + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | vite-build | 577.47 MiB | 7.53 MiB | 327.03 MiB | 31.11 MiB |
| 默认规模 | Vite 构建 + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | vite-build | 597.17 MiB | 19.70 MiB | 340.11 MiB | 12.54 MiB |
| 默认规模 | Vite dev/HMR + @tailwindcss/postcss | @tailwindcss/postcss | vite-hmr | 603.48 MiB | 6.31 MiB | 365.32 MiB | 46.06 MiB |
| 默认规模 | Vite dev/HMR + @tailwindcss/vite | @tailwindcss/vite | vite-hmr | 626.45 MiB | 22.91 MiB | 369.41 MiB | -20.42 MiB |
| 默认规模 | Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | vite-hmr | 660.63 MiB | 34.17 MiB | 405.13 MiB | 54.26 MiB |
| 默认规模 | Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | vite-hmr | 673.78 MiB | 13.16 MiB | 425.33 MiB | 17.82 MiB |
| 默认规模 | Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | vite-hmr | 689.27 MiB | 15.48 MiB | 447.21 MiB | 30.07 MiB |

## 大数量级选择器

### 生成核心

中位数最快：weapp-tailwindcss 生成器 incrementalCache cold（0.06ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| weapp-tailwindcss 生成器 target=weapp scanSources=true | weapp-tailwindcss/generator | 159.83ms | 154.36ms | 175.78ms | 197.8 KiB | 5000 | 4689 |
| weapp-tailwindcss 生成器 target=web scanSources=true | weapp-tailwindcss/generator | 75.15ms | 71.30ms | 82.92ms | 273.2 KiB | 5000 | 5066 |
| weapp-tailwindcss 生成器 target=weapp scanSources=false candidates | weapp-tailwindcss/generator | 161.41ms | 162.28ms | 164.02ms | 197.8 KiB | 5000 | 4689 |
| weapp-tailwindcss 生成器 target=web scanSources=false candidates | weapp-tailwindcss/generator | 107.62ms | 111.00ms | 111.56ms | 273.2 KiB | 5000 | 5066 |
| weapp-tailwindcss 生成器 incrementalCache cold | weapp-tailwindcss/generator | 0.07ms | 0.06ms | 0.09ms | 4.8 KiB | 96 | 95 |
| weapp-tailwindcss 生成器 incrementalCache hit | weapp-tailwindcss/generator | 0.10ms | 0.10ms | 0.11ms | 4.8 KiB | 96 | 95 |
| weapp-tailwindcss 生成器 incrementalCache append | weapp-tailwindcss/generator | 7.87ms | 8.06ms | 8.54ms | 6.1 KiB | 120 | 121 |
| @tailwindcss/postcss 直接 PostCSS 处理 | @tailwindcss/postcss | 17.60ms | 14.77ms | 25.98ms | 183.5 KiB | - | 5043 |

### Vite 构建

中位数最快：Vite 构建 + @tailwindcss/postcss（46.00ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vite 构建 + @tailwindcss/postcss | @tailwindcss/postcss | 40.18ms | 46.00ms | 46.93ms | 183.5 KiB | - | 5043 |
| Vite 构建 + @tailwindcss/vite | @tailwindcss/vite | 82.09ms | 83.05ms | 83.16ms | 262.6 KiB | - | 5079 |
| Vite 构建 + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | 202.84ms | 191.35ms | 226.69ms | 197.3 KiB | - | 4688 |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 207.79ms | 203.98ms | 217.49ms | 273.1 KiB | - | 5066 |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 442.34ms | 457.01ms | 459.23ms | 255.4 KiB | - | 5039 |

### Vite dev/HMR

中位数最快：Vite dev/HMR + @tailwindcss/vite（41.08ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vite dev/HMR + @tailwindcss/postcss | @tailwindcss/postcss | 80.45ms | 78.19ms | 85.01ms | 194.6 KiB | - | 5045 |
| Vite dev/HMR + @tailwindcss/vite | @tailwindcss/vite | 40.93ms | 41.08ms | 44.29ms | 300.9 KiB | - | 5069 |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | 4466.12ms | 4798.06ms | 5124.10ms | 211.8 KiB | - | 4690 |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 223.88ms | 224.10ms | 226.50ms | 282.4 KiB | - | 5042 |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 266.87ms | 265.68ms | 281.25ms | 282.4 KiB | - | 5042 |

### 内存占用

| 场景 | 用例 | 插件 | 模式 | RSS 峰值 | RSS 增量 | Heap 峰值 | Heap 增量 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 大数量级选择器 | weapp-tailwindcss 生成器 target=weapp scanSources=true | weapp-tailwindcss/generator | generator | 775.13 MiB | 83.38 MiB | 499.14 MiB | -78.77 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 target=web scanSources=true | weapp-tailwindcss/generator | generator | 782.88 MiB | 7.75 MiB | 353.66 MiB | 21.82 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 target=weapp scanSources=false candidates | weapp-tailwindcss/generator | generator | 796.06 MiB | 13.19 MiB | 424.72 MiB | 82.36 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 target=web scanSources=false candidates | weapp-tailwindcss/generator | generator | 802.45 MiB | 6.39 MiB | 459.90 MiB | 8.04 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 incrementalCache cold | weapp-tailwindcss/generator | generator | 802.47 MiB | 16.0 KiB | 443.81 MiB | 10.38 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 incrementalCache hit | weapp-tailwindcss/generator | generator | 802.47 MiB | 0 B | 444.97 MiB | 1.15 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 incrementalCache append | weapp-tailwindcss/generator | generator | 802.47 MiB | -240.0 KiB | 467.56 MiB | -15.27 MiB |
| 大数量级选择器 | @tailwindcss/postcss 直接 PostCSS 处理 | @tailwindcss/postcss | generator | 816.25 MiB | 14.02 MiB | 485.71 MiB | 56.00 MiB |
| 大数量级选择器 | Vite 构建 + @tailwindcss/postcss | @tailwindcss/postcss | vite-build | 817.81 MiB | 1.56 MiB | 485.72 MiB | -39.15 MiB |
| 大数量级选择器 | Vite 构建 + @tailwindcss/vite | @tailwindcss/vite | vite-build | 832.25 MiB | 14.44 MiB | 496.27 MiB | 49.71 MiB |
| 大数量级选择器 | Vite 构建 + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | vite-build | 942.34 MiB | 110.09 MiB | 656.76 MiB | 160.49 MiB |
| 大数量级选择器 | Vite 构建 + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | vite-build | 1026.44 MiB | 84.09 MiB | 740.13 MiB | 83.37 MiB |
| 大数量级选择器 | Vite 构建 + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | vite-build | 1166.23 MiB | 16.86 MiB | 861.40 MiB | -403.00 MiB |
| 大数量级选择器 | Vite dev/HMR + @tailwindcss/postcss | @tailwindcss/postcss | vite-hmr | 1067.22 MiB | 23.92 MiB | 442.94 MiB | 105.81 MiB |
| 大数量级选择器 | Vite dev/HMR + @tailwindcss/vite | @tailwindcss/vite | vite-hmr | 1089.11 MiB | 9.69 MiB | 569.55 MiB | 92.91 MiB |
| 大数量级选择器 | Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | vite-hmr | 1133.98 MiB | 20.28 MiB | 792.65 MiB | 230.22 MiB |
| 大数量级选择器 | Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | vite-hmr | 1217.64 MiB | 44.44 MiB | 912.06 MiB | 111.81 MiB |
| 大数量级选择器 | Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | vite-hmr | 1346.81 MiB | 129.14 MiB | 1040.42 MiB | 128.06 MiB |


## 结果解读

- “生成核心”用例隔离 CSS 生成成本，更适合对比插件的生成性能。
- “Vite 构建”用例包含 bundler 启动、Rollup 输出和插件集成开销，可作为端到端参考。
- “Vite dev/HMR”用例统计 Vite dev server 已启动后，临时源码文件写入、watcher change、module graph invalidation 与重新请求 CSS transform 的耗时；不包含浏览器 WebSocket 传输和页面应用样式的耗时。
- “大数量级选择器”场景用于观察 selector 数量上升后的生成、构建与 HMR 变化。
- 内存数据来自同一 Node 进程的 `process.memoryUsage()`，记录每个 case 的执行前后值、采样峰值和增量；RSS 增量会受 V8 GC 与前序 case 缓存影响，RSS 峰值更适合判断占用上界。
- `weapp` target 包含小程序选择器和 CSS 兼容转换；`web` target 保留浏览器 CSS 形态；`web-compact` 表示 `target='web'` 且开启 `webCompat=true` 的 legacy WebView 兼容降级输出。
