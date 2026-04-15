# Implementation Plan: JS 预检查扩展到全部 Bundler

## Overview

将现有 Vite 专属的 JS 预检查逻辑迁移到共享模块 `src/js/precheck.ts`，导出通用的 `shouldSkipJsTransform` 函数，并集成到 Webpack v5、Webpack v4、Gulp 以及核心 `createContext().transformJs()` 路径中。原 Vite 路径通过 re-export 保持兼容。预检查通过正则快速判断 JS 源码是否需要转译，跳过不必要的 Babel AST 解析。

## Tasks

- [x] 1. 创建共享预检查模块并迁移 Vite 路径
  - [x] 1.1 创建 `packages/weapp-tailwindcss/src/js/precheck.ts`
    - 从 `src/bundlers/vite/js-precheck.ts` 迁移 `FAST_JS_TRANSFORM_HINT_RE` 和 `DEPENDENCY_HINT_RE` 正则
    - 导出 `shouldSkipJsTransform(rawSource: string, options?: CreateJsHandlerOptions): boolean`
    - 在函数内部读取环境变量 `WEAPP_TW_DISABLE_JS_PRECHECK`，为 `'1'` 时直接返回 `false`
    - 保持与原 `shouldSkipViteJsTransform` 完全一致的判断逻辑
    - JSDoc 注释使用中文
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 8.1, 8.2_

  - [x] 1.2 修改 `packages/weapp-tailwindcss/src/bundlers/vite/js-precheck.ts`
    - 移除原有实现，改为从 `../../js/precheck` re-export `shouldSkipJsTransform as shouldSkipViteJsTransform`
    - 确保 `generate-bundle.ts` 中的现有引用无需修改
    - _Requirements: 1.3, 7.4_

  - [x]* 1.3 编写共享预检查模块单元测试 `packages/weapp-tailwindcss/test/js/precheck.test.ts`
    - 空字符串返回 `true`（可跳过）
    - 纯数字/无类名模式的代码返回 `true`
    - 含 `className`、`classList`、`twMerge`、`clsx`、`classnames`、`cn`、`cva` 的代码返回 `false`
    - 含 `text-[`、`bg-[` 等 Tailwind 任意值语法的代码返回 `false`
    - 含 `import`/`export`/`require` 语句的代码返回 `false`
    - `alwaysEscape: true` 时返回 `false`
    - `moduleSpecifierReplacements` 有条目时返回 `false`
    - `wrapExpression: true` 时返回 `false`
    - 环境变量 `WEAPP_TW_DISABLE_JS_PRECHECK=1` 时返回 `false`
    - 验证 re-export 的 `shouldSkipViteJsTransform` 与 `shouldSkipJsTransform` 行为一致
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 7.1, 7.2, 7.3, 7.4, 8.1, 8.2_

- [x] 2. Checkpoint - 确保共享模块和 Vite 路径正常
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. 集成到 Webpack v5 构建路径
  - [x] 3.1 修改 `packages/weapp-tailwindcss/src/bundlers/webpack/BaseUnifiedPlugin/v5-assets.ts`
    - 导入 `shouldSkipJsTransform` from `@/js/precheck`
    - 在 `jsTaskFactories` 循环内的 `transform` 回调中，`jsHandler` 调用前执行预检查
    - 预检查判定可跳过时，直接返回 `{ result: currentSource }`，不调用 `jsHandler`
    - 将当前资产的 `CreateJsHandlerOptions`（含 `staleClassNameFallback`、`tailwindcssMajorVersion`、`filename`、`moduleGraph`）传递给预检查函数
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 3.2 扩展 Webpack v5 测试 `packages/weapp-tailwindcss/test/bundlers/webpack.v5.unit.test.ts`
    - 验证不含类名模式的 JS 资产不调用 `jsHandler`
    - 验证含类名模式的 JS 资产正常调用 `jsHandler`
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. 集成到 Webpack v4 构建路径
  - [x] 4.1 修改 `packages/weapp-tailwindcss/src/bundlers/webpack/BaseUnifiedPlugin/v4-assets.ts`
    - 导入 `shouldSkipJsTransform` from `@/js/precheck`
    - 在 `jsTaskFactories` 循环内的 `transform` 回调中，`jsHandler` 调用前执行预检查
    - 预检查判定可跳过时，直接返回 `{ result: currentSource }`，不调用 `jsHandler`
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 5. 集成到 Gulp 构建路径
  - [x] 5.1 修改 `packages/weapp-tailwindcss/src/bundlers/gulp/index.ts`
    - 导入 `shouldSkipJsTransform` from `@/js/precheck`
    - 在 `transformJs` 的 `transform` 回调中，`jsHandler` 调用前执行预检查
    - 预检查判定可跳过时，直接返回 `{ result: currentSource }`，不调用 `jsHandler`
    - 将 `handlerOptions`（含 `filename`、`moduleGraph`、`tailwindcssMajorVersion`）传递给预检查函数
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 6. 集成到核心 `createContext().transformJs()` API
  - [x] 6.1 修改 `packages/weapp-tailwindcss/src/core.ts`
    - 导入 `shouldSkipJsTransform` from `@/js/precheck`
    - 在 `transformJs` 函数中，`jsHandler` 调用前执行预检查
    - 预检查判定可跳过时，返回未修改的原始源码（构造与 `jsHandler` 一致的返回结构）
    - 将 `resolveTransformJsOptions(options)` 的结果传递给预检查函数
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 7. Checkpoint - 确保所有 Bundler 集成正确
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. 编写属性测试
  - [x]* 8.1 编写 Property 1 属性测试 `packages/weapp-tailwindcss/test/js/precheck.properties.test.ts`
    - **Property 1: 迁移等价性**
    - 使用 fast-check 随机生成源码字符串和 `CreateJsHandlerOptions` 配置，验证 `shouldSkipJsTransform` 与原 `shouldSkipViteJsTransform` 返回值一致
    - **Validates: Requirements 1.3, 7.4**

  - [x]* 8.2 编写 Property 2 属性测试
    - **Property 2: 强制选项阻止跳过**
    - 随机生成源码，设置 `alwaysEscape: true` 或 `moduleSpecifierReplacements` 有条目或 `wrapExpression: true`，验证返回 `false`
    - **Validates: Requirements 2.2, 2.3, 2.4**

  - [x]* 8.3 编写 Property 3 属性测试
    - **Property 3: 依赖语句阻止跳过**
    - 随机生成含 `import`/`export`/`require` 语句的源码（无强制选项），验证返回 `false`
    - **Validates: Requirements 2.5, 7.2**

  - [x]* 8.4 编写 Property 4 属性测试
    - **Property 4: 类名模式阻止跳过**
    - 随机生成含 `className`、`classList`、`twMerge`、`clsx`、`classnames`、`cn`、`cva`、`text-[`、`bg-[` 等模式的源码，验证返回 `false`
    - **Validates: Requirements 2.6, 7.1, 7.3**

  - [x]* 8.5 编写 Property 5 属性测试
    - **Property 5: 无匹配则跳过**
    - 随机生成不含任何匹配模式的非空源码（无强制选项），验证返回 `true`
    - **Validates: Requirements 2.7**

  - [x]* 8.6 编写 Property 6 属性测试
    - **Property 6: 环境变量禁用预检查**
    - 随机生成源码，设置环境变量 `WEAPP_TW_DISABLE_JS_PRECHECK=1`，验证返回 `false`
    - **Validates: Requirements 8.1**

- [x] 9. Final checkpoint - 全量验证
  - 运行 `pnpm --filter weapp-tailwindcss test` 确保全部测试通过
  - 确认 Vite 路径的 `shouldSkipViteJsTransform` re-export 正常工作
  - 确认现有 Vite 预检查测试 `test/vite/js-precheck.test.ts` 通过
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 共享模块位于 `src/js/precheck.ts`，与 JS 处理器同目录，职责清晰
- Vite 路径通过 re-export 保持向后兼容，`generate-bundle.ts` 无需修改
- 环境变量 `WEAPP_TW_DISABLE_JS_PRECHECK` 在共享模块内部读取，各 bundler 无需重复判断
- Vite 路径原有的 `WEAPP_TW_VITE_DISABLE_JS_PRECHECK` 在 `generate-bundle.ts` 中继续生效
- 属性测试使用 fast-check 库，每个属性至少运行 100 次迭代
- 每个属性测试标注格式：**Feature: js-precheck-universal, Property {number}: {property_text}**
