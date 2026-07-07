# Tailwind CSS v4 插件性能 Benchmark

生成时间：2026-07-07T03:20:29.573Z

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
| 正式轮数 | 5 |
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

- 全量生成核心最快的是 weapp-tailwindcss 生成器 target=web scanSources=false candidates，中位数 6.03ms，输出选择器数 666。
- 增量缓存命中路径中位数 0.08ms，追加候选类路径中位数 5.96ms；这两项只覆盖局部候选类更新，不和全量生成直接等价。
- Vite 构建最快的是 Vite 构建 + @tailwindcss/postcss，中位数 14.32ms，CSS 大小 42.1 KiB。
- Vite dev/HMR 最快的是 Vite dev/HMR + @tailwindcss/vite（14.14ms），最慢的是 Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp'（91.39ms），差距约 6.46x。
- RSS 峰值最高的是 Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact，峰值 722.31 MiB，本 case RSS 增量 21.78 MiB。

### 大数量级选择器

- 全量生成核心最快的是 @tailwindcss/postcss 直接 PostCSS 处理，中位数 9.07ms，输出选择器数 5043。
- 增量缓存命中路径中位数 0.09ms，追加候选类路径中位数 6.28ms；这两项只覆盖局部候选类更新，不和全量生成直接等价。
- Vite 构建最快的是 Vite 构建 + @tailwindcss/postcss，中位数 20.23ms，CSS 大小 183.5 KiB。
- Vite dev/HMR 最快的是 Vite dev/HMR + @tailwindcss/vite（42.46ms），最慢的是 Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp'（3426.88ms），差距约 80.71x。
- RSS 峰值最高的是 Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact，峰值 1528.66 MiB，本 case RSS 增量 104.00 MiB。

### 规模放大观察

- 候选类数量从 600 增加到 5000，约 8.33x。
- weapp-tailwindcss 生成器 target=weapp scanSources=true：中位数从 22.19ms 到 126.59ms，放大约 5.70x；RSS 峰值从 424.45 MiB 到 809.91 MiB。
- weapp-tailwindcss 生成器 target=web scanSources=true：中位数从 8.81ms 到 63.94ms，放大约 7.26x；RSS 峰值从 430.63 MiB 到 809.91 MiB。
- @tailwindcss/postcss 直接 PostCSS 处理：中位数从 6.17ms 到 9.07ms，放大约 1.47x；RSS 峰值从 451.17 MiB 到 839.41 MiB。
- Vite 构建 + weapp-tailwindcss/vite generator.target='weapp'：中位数从 34.34ms 到 200.05ms，放大约 5.83x；RSS 峰值从 578.95 MiB 到 1057.11 MiB。
- Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp'：中位数从 91.39ms 到 3426.88ms，放大约 37.50x；RSS 峰值从 687.50 MiB 到 1387.06 MiB。

## Web target 与官方插件对比

`weapp-tailwindcss/vite generator.target='web'` 用来观察浏览器 Web 输出路径；`web-compact` 在本报告中固定为 `generator.target='web', webCompat=true`，用于观察 legacy WebView 兼容降级后的耗时、产物体积、选择器数量和内存变化。

对比基线包含 `@tailwindcss/postcss` 与 `@tailwindcss/vite`。表格里的“相对 @tailwindcss/vite”和“相对 @tailwindcss/postcss”均以中位数耗时计算；低于 `1.00x` 表示更快，高于 `1.00x` 表示更慢。

### 默认规模

#### Vite 构建

- Vite 构建：中位数最快的是 Vite 构建 + @tailwindcss/postcss，为 14.32ms。
- Vite 构建：web-compact 相对普通 web 的耗时比例为 1.06x，CSS 大小变化 -10.3%，RSS 峰值变化 +1.8%。

| 用例 | 插件 | 中位数 | 相对 @tailwindcss/vite | 相对 @tailwindcss/postcss | CSS 大小 | CSS 体积相对 vite | 选择器数 | RSS 峰值 | RSS 增量 | Heap 峰值 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Vite 构建 + @tailwindcss/postcss | @tailwindcss/postcss | 14.32ms | 0.78x | 1.00x | 42.1 KiB | +3.6% | 674 | 478.70 MiB | 27.53 MiB | 248.01 MiB |
| Vite 构建 + @tailwindcss/vite | @tailwindcss/vite | 18.41ms | 1.00x | 1.29x | 40.7 KiB | +0.0% | 680 | 500.16 MiB | 21.45 MiB | 253.48 MiB |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 35.10ms | 1.91x | 2.45x | 41.3 KiB | +1.6% | 667 | 588.28 MiB | 9.33 MiB | 351.18 MiB |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 37.09ms | 2.01x | 2.59x | 37.0 KiB | -8.9% | 640 | 598.94 MiB | 10.66 MiB | 361.36 MiB |

#### Vite dev/HMR

- Vite dev/HMR：中位数最快的是 Vite dev/HMR + @tailwindcss/vite，为 14.14ms。
- Vite dev/HMR：web-compact 相对普通 web 的耗时比例为 1.36x，CSS 大小变化 -10.1%，RSS 峰值变化 +3.1%。

| 用例 | 插件 | 中位数 | 相对 @tailwindcss/vite | 相对 @tailwindcss/postcss | CSS 大小 | CSS 体积相对 vite | 选择器数 | RSS 峰值 | RSS 增量 | Heap 峰值 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Vite dev/HMR + @tailwindcss/postcss | @tailwindcss/postcss | 17.03ms | 1.20x | 1.00x | 46.5 KiB | +2.2% | 677 | 614.05 MiB | 15.11 MiB | 378.16 MiB |
| Vite dev/HMR + @tailwindcss/vite | @tailwindcss/vite | 14.14ms | 1.00x | 0.83x | 45.5 KiB | +0.0% | 669 | 639.50 MiB | 25.39 MiB | 401.56 MiB |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 16.79ms | 1.19x | 0.99x | 45.7 KiB | +0.3% | 669 | 700.53 MiB | 13.03 MiB | 460.78 MiB |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 22.83ms | 1.61x | 1.34x | 41.1 KiB | -9.8% | 642 | 722.31 MiB | 21.78 MiB | 476.61 MiB |

### 大数量级选择器

#### Vite 构建

- Vite 构建：中位数最快的是 Vite 构建 + @tailwindcss/postcss，为 20.23ms。
- Vite 构建：web-compact 相对普通 web 的耗时比例为 1.01x，CSS 大小变化 -6.5%，RSS 峰值变化 +9.2%。

| 用例 | 插件 | 中位数 | 相对 @tailwindcss/vite | 相对 @tailwindcss/postcss | CSS 大小 | CSS 体积相对 vite | 选择器数 | RSS 峰值 | RSS 增量 | Heap 峰值 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Vite 构建 + @tailwindcss/postcss | @tailwindcss/postcss | 20.23ms | 0.28x | 1.00x | 183.5 KiB | -30.1% | 5043 | 841.77 MiB | 2.36 MiB | 541.98 MiB |
| Vite 构建 + @tailwindcss/vite | @tailwindcss/vite | 73.16ms | 1.00x | 3.62x | 262.6 KiB | +0.0% | 5079 | 899.13 MiB | 57.36 MiB | 584.39 MiB |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 213.26ms | 2.92x | 10.54x | 273.1 KiB | +4.0% | 5066 | 1167.14 MiB | 110.03 MiB | 886.01 MiB |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 215.17ms | 2.94x | 10.63x | 255.4 KiB | -2.8% | 5039 | 1274.27 MiB | 107.13 MiB | 981.73 MiB |

#### Vite dev/HMR

- Vite dev/HMR：中位数最快的是 Vite dev/HMR + @tailwindcss/vite，为 42.46ms。
- Vite dev/HMR：web-compact 相对普通 web 的耗时比例为 1.48x，CSS 大小变化 -6.2%，RSS 峰值变化 +7.3%。

| 用例 | 插件 | 中位数 | 相对 @tailwindcss/vite | 相对 @tailwindcss/postcss | CSS 大小 | CSS 体积相对 vite | 选择器数 | RSS 峰值 | RSS 增量 | Heap 峰值 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Vite dev/HMR + @tailwindcss/postcss | @tailwindcss/postcss | 74.98ms | 1.77x | 1.00x | 194.6 KiB | -35.3% | 5046 | 1423.17 MiB | 148.91 MiB | 1119.32 MiB |
| Vite dev/HMR + @tailwindcss/vite | @tailwindcss/vite | 42.46ms | 1.00x | 0.57x | 300.9 KiB | +0.0% | 5069 | 1423.23 MiB | -104.31 MiB | 1119.52 MiB |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 109.31ms | 2.57x | 1.46x | 301.1 KiB | +0.1% | 5069 | 1424.66 MiB | 37.55 MiB | 1028.47 MiB |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 162.03ms | 3.82x | 2.16x | 282.4 KiB | -6.1% | 5042 | 1528.66 MiB | 104.00 MiB | 1179.66 MiB |

## 默认规模

### 生成核心

中位数最快：weapp-tailwindcss 生成器 incrementalCache cold（0.05ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| weapp-tailwindcss 生成器 target=weapp scanSources=true | weapp-tailwindcss/generator | 22.79ms | 22.19ms | 29.13ms | 27.6 KiB | 601 | 569 |
| weapp-tailwindcss 生成器 target=web scanSources=true | weapp-tailwindcss/generator | 8.65ms | 8.81ms | 9.28ms | 41.4 KiB | 601 | 667 |
| weapp-tailwindcss 生成器 target=weapp scanSources=false candidates | weapp-tailwindcss/generator | 20.50ms | 20.73ms | 26.32ms | 27.5 KiB | 600 | 568 |
| weapp-tailwindcss 生成器 target=web scanSources=false candidates | weapp-tailwindcss/generator | 6.35ms | 6.03ms | 7.55ms | 41.3 KiB | 600 | 666 |
| weapp-tailwindcss 生成器 incrementalCache cold | weapp-tailwindcss/generator | 0.06ms | 0.05ms | 0.09ms | 4.8 KiB | 96 | 95 |
| weapp-tailwindcss 生成器 incrementalCache hit | weapp-tailwindcss/generator | 0.09ms | 0.08ms | 0.10ms | 4.8 KiB | 96 | 95 |
| weapp-tailwindcss 生成器 incrementalCache append | weapp-tailwindcss/generator | 6.13ms | 5.96ms | 7.20ms | 6.2 KiB | 120 | 122 |
| @tailwindcss/postcss 直接 PostCSS 处理 | @tailwindcss/postcss | 6.30ms | 6.17ms | 7.42ms | 42.1 KiB | - | 674 |

### Vite 构建

中位数最快：Vite 构建 + @tailwindcss/postcss（14.32ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vite 构建 + @tailwindcss/postcss | @tailwindcss/postcss | 14.57ms | 14.32ms | 16.25ms | 42.1 KiB | - | 674 |
| Vite 构建 + @tailwindcss/vite | @tailwindcss/vite | 18.39ms | 18.41ms | 20.12ms | 40.7 KiB | - | 680 |
| Vite 构建 + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | 34.00ms | 34.34ms | 35.51ms | 27.3 KiB | - | 568 |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 35.02ms | 35.10ms | 35.59ms | 41.3 KiB | - | 667 |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 44.06ms | 37.09ms | 72.15ms | 37.0 KiB | - | 640 |

### Vite dev/HMR

中位数最快：Vite dev/HMR + @tailwindcss/vite（14.14ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vite dev/HMR + @tailwindcss/postcss | @tailwindcss/postcss | 17.68ms | 17.03ms | 20.90ms | 46.5 KiB | - | 677 |
| Vite dev/HMR + @tailwindcss/vite | @tailwindcss/vite | 14.80ms | 14.14ms | 17.71ms | 45.5 KiB | - | 669 |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | 93.08ms | 91.39ms | 100.66ms | 29.7 KiB | - | 569 |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 16.85ms | 16.79ms | 21.14ms | 45.7 KiB | - | 669 |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 22.46ms | 22.83ms | 23.13ms | 41.1 KiB | - | 642 |

### 内存占用

| 场景 | 用例 | 插件 | 模式 | RSS 峰值 | RSS 增量 | Heap 峰值 | Heap 增量 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 默认规模 | weapp-tailwindcss 生成器 target=weapp scanSources=true | weapp-tailwindcss/generator | generator | 424.45 MiB | 56.36 MiB | 218.06 MiB | 17.00 MiB |
| 默认规模 | weapp-tailwindcss 生成器 target=web scanSources=true | weapp-tailwindcss/generator | generator | 430.63 MiB | 6.17 MiB | 230.52 MiB | 40.14 MiB |
| 默认规模 | weapp-tailwindcss 生成器 target=weapp scanSources=false candidates | weapp-tailwindcss/generator | generator | 448.97 MiB | 18.08 MiB | 237.03 MiB | -69.99 MiB |
| 默认规模 | weapp-tailwindcss 生成器 target=web scanSources=false candidates | weapp-tailwindcss/generator | generator | 449.42 MiB | 736.0 KiB | 179.56 MiB | 29.56 MiB |
| 默认规模 | weapp-tailwindcss 生成器 incrementalCache cold | weapp-tailwindcss/generator | generator | 449.45 MiB | 32.0 KiB | 179.60 MiB | -20.49 MiB |
| 默认规模 | weapp-tailwindcss 生成器 incrementalCache hit | weapp-tailwindcss/generator | generator | 449.45 MiB | 0 B | 160.85 MiB | 1.73 MiB |
| 默认规模 | weapp-tailwindcss 生成器 incrementalCache append | weapp-tailwindcss/generator | generator | 449.45 MiB | 0 B | 185.39 MiB | 9.46 MiB |
| 默认规模 | @tailwindcss/postcss 直接 PostCSS 处理 | @tailwindcss/postcss | generator | 451.17 MiB | 1.72 MiB | 199.61 MiB | 29.31 MiB |
| 默认规模 | Vite 构建 + @tailwindcss/postcss | @tailwindcss/postcss | vite-build | 478.70 MiB | 27.53 MiB | 248.01 MiB | 48.39 MiB |
| 默认规模 | Vite 构建 + @tailwindcss/vite | @tailwindcss/vite | vite-build | 500.16 MiB | 21.45 MiB | 253.48 MiB | 4.66 MiB |
| 默认规模 | Vite 构建 + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | vite-build | 578.95 MiB | 78.80 MiB | 337.66 MiB | 43.37 MiB |
| 默认规模 | Vite 构建 + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | vite-build | 588.28 MiB | 9.33 MiB | 351.18 MiB | 54.73 MiB |
| 默认规模 | Vite 构建 + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | vite-build | 598.94 MiB | 10.66 MiB | 361.36 MiB | -12.32 MiB |
| 默认规模 | Vite dev/HMR + @tailwindcss/postcss | @tailwindcss/postcss | vite-hmr | 614.05 MiB | 15.11 MiB | 378.16 MiB | 33.11 MiB |
| 默认规模 | Vite dev/HMR + @tailwindcss/vite | @tailwindcss/vite | vite-hmr | 639.50 MiB | 25.39 MiB | 401.56 MiB | -926.1 KiB |
| 默认规模 | Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | vite-hmr | 687.50 MiB | 48.00 MiB | 441.56 MiB | 70.64 MiB |
| 默认规模 | Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | vite-hmr | 700.53 MiB | 13.03 MiB | 460.78 MiB | 18.03 MiB |
| 默认规模 | Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | vite-hmr | 722.31 MiB | 21.78 MiB | 476.61 MiB | -23.02 MiB |

## 大数量级选择器

### 生成核心

中位数最快：weapp-tailwindcss 生成器 incrementalCache cold（0.05ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| weapp-tailwindcss 生成器 target=weapp scanSources=true | weapp-tailwindcss/generator | 133.16ms | 126.59ms | 160.82ms | 197.8 KiB | 5000 | 4689 |
| weapp-tailwindcss 生成器 target=web scanSources=true | weapp-tailwindcss/generator | 63.12ms | 63.94ms | 65.60ms | 273.2 KiB | 5000 | 5066 |
| weapp-tailwindcss 生成器 target=weapp scanSources=false candidates | weapp-tailwindcss/generator | 149.50ms | 150.12ms | 153.34ms | 197.8 KiB | 5000 | 4689 |
| weapp-tailwindcss 生成器 target=web scanSources=false candidates | weapp-tailwindcss/generator | 86.40ms | 86.87ms | 88.51ms | 273.2 KiB | 5000 | 5066 |
| weapp-tailwindcss 生成器 incrementalCache cold | weapp-tailwindcss/generator | 0.05ms | 0.05ms | 0.07ms | 4.8 KiB | 96 | 95 |
| weapp-tailwindcss 生成器 incrementalCache hit | weapp-tailwindcss/generator | 0.10ms | 0.09ms | 0.16ms | 4.8 KiB | 96 | 95 |
| weapp-tailwindcss 生成器 incrementalCache append | weapp-tailwindcss/generator | 6.62ms | 6.28ms | 8.04ms | 6.2 KiB | 120 | 122 |
| @tailwindcss/postcss 直接 PostCSS 处理 | @tailwindcss/postcss | 9.88ms | 9.07ms | 13.94ms | 183.5 KiB | - | 5043 |

### Vite 构建

中位数最快：Vite 构建 + @tailwindcss/postcss（20.23ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vite 构建 + @tailwindcss/postcss | @tailwindcss/postcss | 19.77ms | 20.23ms | 20.90ms | 183.5 KiB | - | 5043 |
| Vite 构建 + @tailwindcss/vite | @tailwindcss/vite | 74.52ms | 73.16ms | 87.90ms | 262.6 KiB | - | 5079 |
| Vite 构建 + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | 200.24ms | 200.05ms | 205.81ms | 197.5 KiB | - | 4688 |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 213.92ms | 213.26ms | 218.59ms | 273.1 KiB | - | 5066 |
| Vite 构建 + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 215.31ms | 215.17ms | 221.46ms | 255.4 KiB | - | 5039 |

### Vite dev/HMR

中位数最快：Vite dev/HMR + @tailwindcss/vite（42.46ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vite dev/HMR + @tailwindcss/postcss | @tailwindcss/postcss | 76.76ms | 74.98ms | 80.25ms | 194.6 KiB | - | 5046 |
| Vite dev/HMR + @tailwindcss/vite | @tailwindcss/vite | 42.12ms | 42.46ms | 43.49ms | 300.9 KiB | - | 5069 |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | 3431.25ms | 3426.88ms | 3480.20ms | 212.1 KiB | - | 4690 |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 110.80ms | 109.31ms | 115.18ms | 301.1 KiB | - | 5069 |
| Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | 162.69ms | 162.03ms | 173.46ms | 282.4 KiB | - | 5042 |

### 内存占用

| 场景 | 用例 | 插件 | 模式 | RSS 峰值 | RSS 增量 | Heap 峰值 | Heap 增量 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 大数量级选择器 | weapp-tailwindcss 生成器 target=weapp scanSources=true | weapp-tailwindcss/generator | generator | 809.91 MiB | 87.16 MiB | 515.37 MiB | -80.47 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 target=web scanSources=true | weapp-tailwindcss/generator | generator | 809.91 MiB | -13.28 MiB | 363.67 MiB | -24.15 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 target=weapp scanSources=false candidates | weapp-tailwindcss/generator | generator | 817.11 MiB | 20.48 MiB | 433.50 MiB | 91.87 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 target=web scanSources=false candidates | weapp-tailwindcss/generator | generator | 826.41 MiB | 9.30 MiB | 496.22 MiB | 64.18 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 incrementalCache cold | weapp-tailwindcss/generator | generator | 826.41 MiB | 0 B | 507.24 MiB | 10.67 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 incrementalCache hit | weapp-tailwindcss/generator | generator | 826.41 MiB | 0 B | 508.97 MiB | 1.72 MiB |
| 大数量级选择器 | weapp-tailwindcss 生成器 incrementalCache append | weapp-tailwindcss/generator | generator | 826.41 MiB | -592.0 KiB | 520.84 MiB | 9.30 MiB |
| 大数量级选择器 | @tailwindcss/postcss 直接 PostCSS 处理 | @tailwindcss/postcss | generator | 839.41 MiB | 13.58 MiB | 541.01 MiB | 22.73 MiB |
| 大数量级选择器 | Vite 构建 + @tailwindcss/postcss | @tailwindcss/postcss | vite-build | 841.77 MiB | 2.36 MiB | 541.98 MiB | -6.01 MiB |
| 大数量级选择器 | Vite 构建 + @tailwindcss/vite | @tailwindcss/vite | vite-build | 899.13 MiB | 57.36 MiB | 584.39 MiB | 49.32 MiB |
| 大数量级选择器 | Vite 构建 + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | vite-build | 1057.11 MiB | 157.98 MiB | 767.99 MiB | 183.60 MiB |
| 大数量级选择器 | Vite 构建 + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | vite-build | 1167.14 MiB | 110.03 MiB | 886.01 MiB | 118.02 MiB |
| 大数量级选择器 | Vite 构建 + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | vite-build | 1274.27 MiB | 107.13 MiB | 981.73 MiB | 95.72 MiB |
| 大数量级选择器 | Vite dev/HMR + @tailwindcss/postcss | @tailwindcss/postcss | vite-hmr | 1423.17 MiB | 148.91 MiB | 1119.32 MiB | 137.58 MiB |
| 大数量级选择器 | Vite dev/HMR + @tailwindcss/vite | @tailwindcss/vite | vite-hmr | 1423.23 MiB | -104.31 MiB | 1119.52 MiB | -602.48 MiB |
| 大数量级选择器 | Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | vite-hmr | 1387.06 MiB | 11.98 MiB | 935.75 MiB | 297.98 MiB |
| 大数量级选择器 | Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | vite-hmr | 1424.66 MiB | 37.55 MiB | 1028.47 MiB | 92.67 MiB |
| 大数量级选择器 | Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact | weapp-tailwindcss/vite | vite-hmr | 1528.66 MiB | 104.00 MiB | 1179.66 MiB | 143.87 MiB |


## 结果解读

- “生成核心”用例隔离 CSS 生成成本，更适合对比插件的生成性能。
- “Vite 构建”用例包含 bundler 启动、Rollup 输出和插件集成开销，可作为端到端参考。
- “Vite dev/HMR”用例统计 Vite dev server 已启动后，临时源码文件写入、watcher change、module graph invalidation 与重新请求 CSS transform 的耗时；不包含浏览器 WebSocket 传输和页面应用样式的耗时。
- “大数量级选择器”场景用于观察 selector 数量上升后的生成、构建与 HMR 变化。
- 内存数据来自同一 Node 进程的 `process.memoryUsage()`，记录每个 case 的执行前后值、采样峰值和增量；RSS 增量会受 V8 GC 与前序 case 缓存影响，RSS 峰值更适合判断占用上界。
- `weapp` target 包含小程序选择器和 CSS 兼容转换；`web` target 保留浏览器 CSS 形态；`web-compact` 表示 `target='web'` 且开启 `webCompat=true` 的 legacy WebView 兼容降级输出。
