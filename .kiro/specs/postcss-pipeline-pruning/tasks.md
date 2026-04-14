# Implementation Plan: PostCSS Pipeline 按需裁剪

## Overview

在 `@weapp-tailwindcss/postcss` 的 PostCSS 流水线中引入 Content Probe 模块，通过正则/字符串匹配快速探测 CSS 内容特征，按需跳过 Normal 阶段中不必要的插件（`postcss-preset-env`、`color-functional-fallback`），减少 AST 遍历次数，同时保持完全向后兼容。

## Tasks

- [x] 1. 实现 Content Probe 模块
  - [x] 1.1 创建 `packages/postcss/src/content-probe.ts`
    - 定义 `FeatureSignal` 接口，包含 `hasModernColorFunction` 和 `hasPresetEnvFeatures` 两个布尔字段
    - 导出 `FULL_SIGNAL`（全 true）和 `EMPTY_SIGNAL`（全 false）常量
    - 实现 `probeFeatures(css: string): FeatureSignal` 函数
      - `hasModernColorFunction`：使用正则检测 `rgb(r g b / a)` 空格分隔写法
      - `hasPresetEnvFeatures`：使用 `includes()` 检测 `:is(`、`oklab(`、`oklch(`、`color-mix(`、`@layer `、`color(` 关键字
    - 实现 `signalToCacheKey(signal: FeatureSignal): string` 函数，将信号序列化为缓存键片段
    - 空字符串输入返回全 false 信号
    - JSDoc 注释使用中文
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x]* 1.2 编写 Content Probe 单元测试 `packages/postcss/test/content-probe.test.ts`
    - 空字符串返回全 false
    - 包含 `rgb(r g b / a)` 的 CSS 返回 `hasModernColorFunction: true`
    - 包含 `:is()`、`oklab()`、`oklch()`、`color-mix()`、`@layer`、`color()` 的 CSS 返回 `hasPresetEnvFeatures: true`
    - 不包含任何特征的简单 CSS 返回全 false
    - 注释中包含特征关键字时仍返回 true（允许误报）
    - `signalToCacheKey` 对不同信号产生不同键
    - `FULL_SIGNAL` 和 `EMPTY_SIGNAL` 值正确
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1, 6.2_

- [x] 2. 修改 Pipeline 支持信号驱动裁剪
  - [x] 2.1 修改 `packages/postcss/src/pipeline.ts`
    - 导入 `FeatureSignal` 类型
    - `createPreparedNodes` 增加可选 `signal?: FeatureSignal` 参数
    - 当 `signal` 存在且 `signal.hasPresetEnvFeatures` 为 `false` 时，跳过 `normal:preset-env` 节点
    - 当 `signal` 存在且 `signal.hasModernColorFunction` 为 `false` 时，跳过 `normal:color-functional-fallback` 节点
    - `signal` 为 `undefined` 时行为与当前完全一致（向后兼容）
    - `createStylePipeline` 增加可选 `signal?: FeatureSignal` 参数并传递给 `createPreparedNodes`
    - Pre/Post 阶段插件和基于选项控制的插件不受信号影响
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 5.2_

  - [x]* 2.2 扩展 Pipeline 测试 `packages/postcss/test/pipeline.test.ts`
    - 传入全 false 信号时 pipeline 不包含 `preset-env` 和 `color-functional-fallback`
    - 传入全 true 信号时 pipeline 包含所有插件
    - 不传 signal 时行为与当前一致
    - 混合信号（一个 true 一个 false）正确裁剪
    - Pre/Post 阶段插件不受信号影响
    - 基于选项控制的插件（units-to-px、px-transform 等）不受信号影响
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Checkpoint - 确保 Content Probe 和 Pipeline 裁剪正确
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. 修改 Cache 层支持信号感知
  - [x] 4.1 修改 `packages/postcss/src/processor-cache.ts`
    - 导入 `FeatureSignal` 和 `signalToCacheKey`
    - `getPipeline` 方法增加可选 `signal?: FeatureSignal` 参数，传递给 `createStylePipeline`
    - `getProcessor` 方法增加可选 `signal?: FeatureSignal` 参数
    - 缓存键计算：将 `signalToCacheKey(signal)` 追加到现有 `optionsFingerprint` 后面形成复合键
    - `signal` 为 `undefined` 时缓存键不包含 signal 部分，保持向后兼容
    - 相同选项 + 不同信号 → 不同 Processor 实例
    - 相同选项 + 相同信号 → 同一 Processor 实例
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x]* 4.2 扩展 Cache 测试 `packages/postcss/test/processor-cache.test.ts`
    - 相同选项 + 不同信号 → 不同 Processor
    - 相同选项 + 相同信号 → 同一 Processor
    - 不传信号时缓存行为不变
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 5. 修改 Handler 层集成探测
  - [x] 5.1 修改 `packages/postcss/src/handler.ts`
    - 导入 `probeFeatures` 和 `FeatureSignal`
    - 在处理函数中调用 `probeFeatures(rawSource)` 获取信号
    - 将信号传递给 `cache.getProcessor(resolvedOptions, signal)`
    - 使用 try-catch 包裹探测调用，异常时 signal 设为 `undefined`（回退到全量加载）
    - 公开 API 签名不变
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x]* 5.2 扩展 Handler 集成测试 `packages/postcss/test/handler.cache.test.ts`
    - 处理不含现代特征的 CSS 时自动跳过插件
    - 探测异常时回退到全量加载
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6. Checkpoint - 确保全链路集成正确
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. 编写属性测试
  - [x]* 7.1 编写 Property 1 属性测试 `packages/postcss/test/content-probe.properties.test.ts`
    - **Property 1: 探测完备性（无漏报）**
    - 使用 fast-check 生成包含已知特征关键字的随机 CSS 字符串，验证 `probeFeatures` 对应标志始终为 true
    - **Validates: Requirements 1.2, 1.3, 6.1, 6.2**

  - [x]* 7.2 编写 Property 2 属性测试
    - **Property 2: 信号驱动的流水线裁剪**
    - 生成随机 `FeatureSignal` 组合，验证 pipeline 节点列表正确包含/排除对应插件
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [x]* 7.3 编写 Property 3 属性测试
    - **Property 3: 信号隔离性**
    - 生成随机 `FeatureSignal` 组合和随机选项配置，验证 pre/post 和选项控制的插件不受信号影响
    - **Validates: Requirements 2.4, 2.5**

  - [x]* 7.4 编写 Property 4 属性测试
    - **Property 4: 流水线等价性**
    - 生成随机 CSS 字符串（混合有/无现代特征），验证裁剪流水线与完整流水线处理结果一致
    - **Validates: Requirements 5.1, 6.1, 6.3**

- [x] 8. Final checkpoint - 全量验证
  - 运行 `pnpm --filter @weapp-tailwindcss/postcss test` 确保全部测试通过
  - 确认 `getPlugins` 兼容函数行为不变
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.3_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Content Probe 仅使用字符串方法和正则，不引入 AST 解析开销
- `getPlugins` 兼容函数不接收 CSS 内容，保持原有行为不传 signal
- 探测策略采用宽松匹配：宁可误报（多加载插件），不可漏报（遗漏需要的插件）
- 属性测试使用 fast-check 库，每个属性至少运行 100 次迭代
- 每个测试标注格式：**Feature: postcss-pipeline-pruning, Property {number}: {property_text}**
