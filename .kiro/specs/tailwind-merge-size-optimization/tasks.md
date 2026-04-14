# Implementation Plan: tailwind-merge-size-optimization

## Overview

为 `@weapp-tailwindcss/merge` 和 `@weapp-tailwindcss/merge-v3` 添加 Lite（`/lite`）和 Slim（`/slim`）子路径入口，通过将配置与算法解耦实现三层体积优化。两个包结构相同，仅 `version` 值和 slim-config API 因 tailwind-merge 版本差异而不同。

## Tasks

- [x] 1. 实现 Merge_Package（`@weapp-tailwindcss/merge`）的 Lite Entry
  - [x] 1.1 创建 `packages-runtime/merge/src/lite.ts`
    - 从 `tailwind-merge` 仅导入 `createTailwindMerge` 和 `twJoin`（不导入 `extendTailwindMerge`、`twMerge`、`getDefaultConfig`）
    - 实现不依赖 Default_Config 的 `extendTailwindMerge` 包装函数
    - 使用 `createRuntimeFactory` 创建 `create` 工厂，`version: 3`
    - 导出 `create`、`createTailwindMerge`、`extendTailwindMerge`、`twJoin`、`weappTwIgnore`、`tailwindMergeVersion` 及类型
    - 不导出 `twMerge`、`getDefaultConfig`、`mergeConfigs`
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 7.1, 7.2, 7.3, 9.1, 9.3_

  - [x]* 1.2 编写 Lite Entry 单元测试 `packages-runtime/merge/test/lite.test.ts`
    - 验证导出符号完整性（包含 `create`、`createTailwindMerge`、`extendTailwindMerge`、`twJoin`、`weappTwIgnore`）
    - 验证不导出 `twMerge`、`getDefaultConfig`、`mergeConfigs`
    - 验证 `createTailwindMerge` 接受用户配置后能正确合并类名
    - 验证 `extendTailwindMerge` 接受基础配置和扩展配置后能正确工作
    - 验证 `twJoin` 正确拼接类名
    - 验证 `create()` 工厂产出的运行时包含 escape/unescape 和 rpx 转换行为
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 6.1, 6.3, 6.5, 6.9, 7.1, 7.2, 7.3_

- [x] 2. 实现 Merge_Package（`@weapp-tailwindcss/merge`）的 Slim Entry
  - [x] 2.1 创建 `packages-runtime/merge/src/slim-config.ts`
    - 基于 tailwind-merge v3 API 编写精简版冲突分组配置
    - 包含高频类别：display, position, visibility, overflow, z-index, flexbox, grid, alignment, spacing, sizing, typography, backgrounds, borders, effects, transforms
    - 排除低频类别：SVG, table, scroll-snap, touch-action, mask, perspective, container queries
    - 导出 `getSlimConfig` 函数
    - _Requirements: 2.1, 2.3, 2.4_

  - [x] 2.2 创建 `packages-runtime/merge/src/slim.ts`
    - 从 `tailwind-merge` 仅导入 `createTailwindMerge` 和 `twJoin`（不导入上游 `extendTailwindMerge`、`twMerge`）
    - 导入 `getSlimConfig` 并基于其创建预配置的 `twMerge`
    - 实现基于 Slim_Config 的 `extendTailwindMerge`
    - 使用 `createRuntimeFactory` 创建 `create` 工厂，`version: 3`
    - 导出 `create`、`createTailwindMerge`、`extendTailwindMerge`、`twMerge`、`twJoin`、`getSlimConfig`、`weappTwIgnore`、`tailwindMergeVersion` 及类型
    - 不导出 `getDefaultConfig`、`mergeConfigs`
    - _Requirements: 2.1, 2.5, 2.6, 2.9, 8.1, 8.2, 8.3, 9.2, 9.4_

  - [x]* 2.3 编写 Slim Entry 单元测试 `packages-runtime/merge/test/slim.test.ts`
    - 验证导出符号完整性
    - 验证不导出 `getDefaultConfig`、`mergeConfigs`
    - 验证 `twMerge` 对已包含类别（display, flexbox, spacing 等）正确解析冲突
    - 验证 `twMerge` 对排除类别（SVG, table, scroll-snap 等）不解析冲突
    - 验证 `extendTailwindMerge` 可扩展 Slim_Config
    - 验证 `create()` 工厂产出的运行时包含 escape/unescape 和 rpx 转换行为
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6, 2.9, 6.2, 6.4, 6.6, 6.10, 8.1, 8.2, 8.3_

- [x] 3. 更新 Merge_Package 构建与导出配置
  - [x] 3.1 更新 `packages-runtime/merge/tsdown.config.ts`
    - 将 entry 扩展为 `['src/index.ts', 'src/slim.ts', 'src/lite.ts']`
    - _Requirements: 4.1, 4.3, 5.1, 5.3_

  - [x] 3.2 更新 `packages-runtime/merge/package.json`
    - 在 `exports` 中添加 `./slim` 和 `./lite` 子路径，包含 ESM/CJS 入口和类型声明
    - 同步更新 `publishConfig.exports`
    - 同步更新 `_exports` 开发映射
    - _Requirements: 4.1, 4.3, 4.4, 5.1, 5.3, 5.4_

- [x] 4. Checkpoint - 验证 Merge_Package 构建与现有测试
  - 构建 `@weapp-tailwindcss/merge`，确保三个入口均正确产出
  - 运行现有测试套件确保 Full Entry 向后兼容
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5. 实现 Merge_V3_Package（`@weapp-tailwindcss/merge-v3`）的 Lite Entry
  - [x] 5.1 创建 `packages-runtime/merge-v3/src/lite.ts`
    - 结构与 merge 包的 lite.ts 相同，但 `version: 2`
    - 从 `tailwind-merge`（v2）导入 `createTailwindMerge` 和 `twJoin`
    - 实现不依赖 Default_Config 的 `extendTailwindMerge` 包装函数
    - 导出与 merge 包 lite 入口相同的符号集
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 7.1, 7.2, 7.3, 9.1, 9.3_

  - [x]* 5.2 编写 Lite Entry 单元测试 `packages-runtime/merge-v3/test/lite.test.ts`
    - 验证导出符号完整性和排除符号
    - 验证工厂函数和 twJoin 行为
    - 验证 create() 运行时封装一致性
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 6.1, 6.3, 6.5, 6.9, 7.1, 7.2, 7.3_

- [x] 6. 实现 Merge_V3_Package（`@weapp-tailwindcss/merge-v3`）的 Slim Entry
  - [x] 6.1 创建 `packages-runtime/merge-v3/src/slim-config.ts`
    - 基于 tailwind-merge v2 API 编写精简版冲突分组配置
    - 包含/排除类别与 merge 包一致，但 API 调用方式适配 v2
    - 导出 `getSlimConfig` 函数
    - _Requirements: 2.2, 2.3, 2.4_

  - [x] 6.2 创建 `packages-runtime/merge-v3/src/slim.ts`
    - 结构与 merge 包的 slim.ts 相同，但 `version: 2`
    - 导入 `getSlimConfig` 并基于其创建预配置的 `twMerge`
    - 实现基于 Slim_Config 的 `extendTailwindMerge`
    - 导出与 merge 包 slim 入口相同的符号集
    - _Requirements: 2.2, 2.5, 2.6, 2.9, 8.1, 8.2, 8.3, 9.2, 9.4_

  - [x]* 6.3 编写 Slim Entry 单元测试 `packages-runtime/merge-v3/test/slim.test.ts`
    - 验证导出符号、冲突解析、排除类别、扩展性、运行时封装
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.9, 6.2, 6.4, 6.6, 6.10, 8.1, 8.2, 8.3_

- [x] 7. 更新 Merge_V3_Package 构建与导出配置
  - [x] 7.1 更新 `packages-runtime/merge-v3/tsdown.config.ts`
    - 将 entry 扩展为 `['src/index.ts', 'src/slim.ts', 'src/lite.ts']`
    - _Requirements: 4.2, 4.3, 5.2, 5.3_

  - [x] 7.2 更新 `packages-runtime/merge-v3/package.json`
    - 在 `exports` 中添加 `./slim` 和 `./lite` 子路径
    - _Requirements: 4.2, 4.3, 4.4, 5.2, 5.3, 5.4_

- [x] 8. Checkpoint - 验证 Merge_V3_Package 构建与现有测试
  - 构建 `@weapp-tailwindcss/merge-v3`，确保三个入口均正确产出
  - 运行现有测试套件确保 Full Entry 向后兼容
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 9. 编写属性测试
  - [ ]* 9.1 编写 Property 1 属性测试（Merge_Package）`packages-runtime/merge/test/properties.test.ts`
    - **Property 1: Lite 工厂函数产出与 Full Entry 行为一致**
    - 使用 fast-check 生成随机简化 tailwind-merge 配置和类字符串
    - 验证 Lite `createTailwindMerge` 与 Full `createTailwindMerge` 在相同配置下产出一致
    - **Validates: Requirements 1.3, 1.5, 6.1, 6.3, 6.7, 6.9**

  - [ ]* 9.2 编写 Property 2 属性测试（Merge_Package）
    - **Property 2: twJoin 跨入口一致性**
    - 生成随机类名数组（含 null、undefined、false、嵌套数组），验证所有入口的 `twJoin` 输出一致
    - **Validates: Requirements 1.4, 2.6**

  - [ ]* 9.3 编写 Property 3 属性测试（Merge_Package）
    - **Property 3: Slim 冲突解析覆盖已包含类别**
    - 从已包含类别中生成随机冲突类对，验证 Slim `twMerge` 与 Full `twMerge` 解析结果一致
    - **Validates: Requirements 2.3, 2.5, 6.2, 6.4, 6.8, 6.10**

  - [ ]* 9.4 编写 Property 4 属性测试（Merge_Package）
    - **Property 4: Slim extendTailwindMerge 扩展性**
    - 生成随机配置扩展，验证 Slim `extendTailwindMerge` 正确处理基础 + 扩展冲突
    - **Validates: Requirements 2.9**

  - [ ]* 9.5 编写 Property 5 属性测试（Merge_Package）
    - **Property 5: Full Entry 向后兼容**
    - 使用现有测试用例的类字符串作为种子，验证 Full Entry 输出不变
    - **Validates: Requirements 3.2, 3.3, 3.4**

  - [ ]* 9.6 编写 Merge_V3_Package 属性测试 `packages-runtime/merge-v3/test/properties.test.ts`
    - 复制 Property 1-5 的测试结构，适配 tailwind-merge v2 API
    - **Validates: Requirements 1.3, 1.4, 1.5, 2.3, 2.5, 2.6, 2.9, 3.2, 3.3, 3.4, 6.1-6.10**

- [x] 10. 编写 Bundle 体积检查测试
  - [ ]* 10.1 编写 Merge_Package 体积检查
    - 构建后测量各入口 ESM 产物大小
    - 断言 Lite Entry < 20KB、Slim Entry < 60KB
    - _Requirements: 1.6, 2.7_

  - [ ]* 10.2 编写 Merge_V3_Package 体积检查
    - 构建后测量各入口 ESM 产物大小
    - 断言 Lite Entry < 15KB、Slim Entry < 45KB
    - _Requirements: 1.7, 2.8_

- [x] 11. Final checkpoint - 全量验证
  - 运行两个包的全部测试套件
  - 验证构建产物完整性（ESM/CJS/DTS 均存在）
  - 验证类型声明通过 `tsd` 检查
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 两个包的 lite.ts 和 slim.ts 结构完全相同，仅 `version` 值和 slim-config 的 API 调用方式因 tailwind-merge 版本差异而不同
- Lite 和 Slim 入口必须不导入上游 `extendTailwindMerge` 或 `twMerge`，因为它们内部硬编码了 `getDefaultConfig` 导入
- `createTailwindMerge` 和 `twJoin` 可安全从上游导入，不会引入 Default_Config
- 所有入口共享 `@weapp-tailwindcss/runtime` 的 `createRuntimeFactory`，确保 escape/unescape、RPX_Transform、LRU_Cache 行为一致
- Property tests 使用 fast-check 库，每个属性至少运行 100 次迭代
