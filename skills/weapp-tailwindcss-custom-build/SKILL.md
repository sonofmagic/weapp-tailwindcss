---
name: weapp-tailwindcss-custom-build
description: 将 weapp-tailwindcss 集成到自研构建器或高级流水线，覆盖 `weapp-tailwindcss/core`、generator、Vite/Webpack/Rspack/Rollup/Rolldown/Gulp 生命周期、ModuleGraph、Tailwind Scanner/source candidates、watch/HMR、source map、weapp-style-injector 和分包样式隔离。Use for custom bundlers, Node API, build adapters, asset graphs, loaders, plugins, or subpackage style injection；普通框架与 CLI 配置使用 setup skill。
---

# weapp-tailwindcss custom build

围绕构建图和内存产物接入核心转换，避免用输出目录扫描补偿生命周期设计缺失。

## 工作流

1. 先判断官方 Vite/Webpack/Rspack/Gulp 入口是否已满足需求；普通项目转到 `$weapp-tailwindcss-setup`。
2. 确认调用方拥有的生命周期、模块图、CSS 生成结果、asset API、watch 事件和 source map 能力。
3. 读取 [references/core-api.md](references/core-api.md) 设计 `createContext()` 的创建、刷新和转换时序。
4. 涉及全局/分包样式注入时再读取 [references/style-injection.md](references/style-injection.md)。
5. 在 `load`、`transform`、loader result、compilation、bundle asset 或 stream/Vinyl 对象中维护源码和产物关系。
6. watch 中先刷新 Tailwind runtime/class set，再转换受影响模板和 JavaScript；配置变化使用完整 refresh，普通源码变化使用 collect。
7. 让初始扫描、transform 与 HMR 共用 Scanner 的文件范围和显式外部 source，不另建宽泛 glob。
8. 通过 bundler API 写回产物和 source map，不直接修改输出目录。

## 不可破坏的边界

- `createContext()` 只转换传入的内存文本；它不扫描输出目录、不替代 Tailwind 入口导入、不替调用方写文件。
- 同一构建周期复用上下文，保证 CSS、模板和 JS 使用同一 runtime set。
- `transformWxss()`、`transformWxml()`、`transformJs()` 返回类型不同，必须分别处理错误和 map。
- 运行时集合来自 Tailwind 生成/验证结果，不把扫描到的所有字符串直接塞入集合。
- 入口发现若确需文件系统扫描，集中在明确扫描层并测试；不要在 `generateBundle` 等后置阶段临时读源码。
- Rspack rule condition 解析必须覆盖函数与组合条件，补丁保持幂等并仅作用于目标 CSS rule。

## 输出要求

输出生命周期图、数据所有权、API 调用时序、错误/缓存策略、产物写回方式和 watch 回归场景。
