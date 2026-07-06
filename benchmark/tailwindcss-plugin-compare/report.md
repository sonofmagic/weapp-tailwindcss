# Tailwind CSS v4 插件性能 Benchmark

生成时间：2026-07-06T06:47:34.747Z

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
| 目标 class 数量 | 600 |
| 源码文件数量 | 12 |
| 实际生成候选类数量 | 349 |

## 生成核心

中位数最快：weapp-tailwindcss 生成器 incrementalCache cold（0.06ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| weapp-tailwindcss 生成器 target=weapp scanSources=true | weapp-tailwindcss/generator | 16.53ms | 16.91ms | 18.78ms | 17.9 KiB | 349 | 295 |
| weapp-tailwindcss 生成器 target=web scanSources=true | weapp-tailwindcss/generator | 7.88ms | 7.44ms | 9.33ms | 35.4 KiB | 349 | 415 |
| weapp-tailwindcss 生成器 target=weapp scanSources=false candidates | weapp-tailwindcss/generator | 11.81ms | 11.35ms | 13.25ms | 17.9 KiB | 349 | 295 |
| weapp-tailwindcss 生成器 target=web scanSources=false candidates | weapp-tailwindcss/generator | 5.00ms | 5.01ms | 5.02ms | 35.4 KiB | 349 | 415 |
| weapp-tailwindcss 生成器 incrementalCache cold | weapp-tailwindcss/generator | 0.07ms | 0.06ms | 0.09ms | 6.9 KiB | 96 | 93 |
| weapp-tailwindcss 生成器 incrementalCache hit | weapp-tailwindcss/generator | 0.10ms | 0.10ms | 0.10ms | 6.9 KiB | 96 | 93 |
| weapp-tailwindcss 生成器 incrementalCache append | weapp-tailwindcss/generator | 6.70ms | 6.70ms | 7.09ms | 10.3 KiB | 120 | 131 |
| @tailwindcss/postcss 直接 PostCSS 处理 | @tailwindcss/postcss | 6.63ms | 6.24ms | 8.26ms | 35.5 KiB | - | 416 |

## Vite Build

中位数最快：Vite build + @tailwindcss/postcss（14.60ms）。

| 用例 | 插件 | 平均值 | 中位数 | P95 | CSS 大小 | Class set | 选择器数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vite build + @tailwindcss/postcss | @tailwindcss/postcss | 14.77ms | 14.60ms | 15.15ms | 35.5 KiB | - | 416 |
| Vite build + @tailwindcss/vite | @tailwindcss/vite | 18.58ms | 17.52ms | 21.65ms | 33.3 KiB | - | 428 |
| Vite build + weapp-tailwindcss/vite generator.target='weapp' | weapp-tailwindcss/vite | 27.95ms | 27.76ms | 30.52ms | 17.5 KiB | - | 294 |
| Vite build + weapp-tailwindcss/vite generator.target='web' | weapp-tailwindcss/vite | 31.30ms | 30.82ms | 32.64ms | 35.3 KiB | - | 415 |

## 结果解读

- “生成核心”用例隔离 CSS 生成成本，更适合对比插件的生成性能。
- “Vite Build”用例包含 bundler 启动、Rollup 输出和插件集成开销，可作为端到端参考。
- `weapp` target 包含小程序选择器和 CSS 兼容转换；`web` target 保留浏览器 CSS 形态。
