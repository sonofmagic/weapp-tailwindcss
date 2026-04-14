# Implementation Plan: JS Handler 缓存策略优化

## Overview

优化 `createJsHandler`（`packages/weapp-tailwindcss/src/js/index.ts`）的结果缓存策略。将 `resultCache` 从 WeakMap+Map+FIFO 替换为 `LRUCache<string, JsHandlerResult>`（max=512），缓存键从原始源码字符串改为 `${optionsFingerprint}:${md5Hash(rawSource)}`，新增 `getOptionsFingerprint` 和 `getClassNameSetId` 辅助函数，简化选项解析从 4 层 WeakMap 到 2 层，移除源码长度限制和 bundler 路径排除逻辑，保持输入输出向后兼容。

## Tasks

- [x] 1. 重构缓存核心：LRU + 内容哈希 + 选项指纹
  - [x] 1.1 新增 `getClassNameSetId` 和 `getOptionsFingerprint` 辅助函数
    - 在 `packages/weapp-tailwindcss/src/js/index.ts` 中新增模块级 `classNameSetIds: WeakMap<Set<string>, number>` 和递增计数器 `nextClassNameSetId`
    - 实现 `getClassNameSetId(set?: Set<string>): string`，为每个 Set 引用分配唯一递增 ID
    - 新增 `fingerprintCache: WeakMap<IJsHandlerOptions, string>`
    - 实现 `getOptionsFingerprint(options: IJsHandlerOptions): string`，序列化影响转译结果的字段（`classNameSet`、`escapeMap`、`needEscaped`、`alwaysEscape`、`unescapeUnicode`、`generateMap`、`uniAppX`、`wrapExpression`、`tailwindcssMajorVersion`、`staleClassNameFallback`、`jsArbitraryValueFallback`、`arbitraryValues`、`ignoreCallExpressionIdentifiers`、`ignoreTaggedTemplateExpressionIdentifiers`、`moduleSpecifierReplacements`、`babelParserOptions`），不包含 `filename`、`moduleGraph`、`jsPreserveClass`
    - 使用 `fingerprintCache` 缓存指纹计算结果，避免重复序列化
    - JSDoc 注释使用中文
    - _Requirements: 1.1, 1.2, 3.2, 6.1, 6.2_

  - [x] 1.2 替换 `resultCache` 为 LRU 缓存
    - 导入 `LRUCache` from `lru-cache` 和 `md5Hash` from `../cache/md5`
    - 新增常量 `RESULT_CACHE_MAX = 512`
    - 将 `resultCache` 从 `WeakMap<IJsHandlerOptions, Map<string, JsHandlerResult>>` 替换为 `new LRUCache<string, JsHandlerResult>({ max: RESULT_CACHE_MAX })`
    - 缓存键格式：`` `${getOptionsFingerprint(resolvedOptions)}:${md5Hash(rawSource)}` ``
    - 移除 `CACHEABLE_SOURCE_MAX_LENGTH`、`RESULT_CACHE_LIMIT` 常量
    - 移除 `shouldCacheJsResult` 函数
    - 重写 `getCachedJsResult`：空源码跳过查找，否则用新键格式查 LRU
    - 重写 `setCachedJsResult`：空源码、含 `error`、含 `linked` 的结果不缓存，否则存入 LRU
    - _Requirements: 1.1, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4_

  - [x] 1.3 简化选项解析缓存为 2 层结构
    - 新增 `NO_CLASSNAME_SET = Symbol('NO_CLASSNAME_SET')` 占位符
    - 将 `resolvedOptionsByClassNameSet` 重命名为 `defaultOptionsCache: WeakMap<Set<string>, IJsHandlerOptions>`
    - 将 `resolvedOverrideOptions` 和 `resolvedOverrideOptionsByClassNameSet` 合并为 `overrideOptionsCache: WeakMap<CreateJsHandlerOptions, WeakMap<Set<string> | typeof NO_CLASSNAME_SET, IJsHandlerOptions>>`
    - 重写 `resolveDefaultOptions` 使用 `defaultOptionsCache`
    - 重写 `resolveOptions` 中有 override 的分支，使用 `overrideOptionsCache` 的 2 层查找
    - 保持引用稳定性：相同输入返回同一 `IJsHandlerOptions` 对象引用
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 2. Checkpoint - 确保核心重构正确
  - 运行 `pnpm --filter weapp-tailwindcss vitest run test/js.test.ts` 确保现有测试全部通过
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. 编写单元测试
  - [~]* 3.1 创建 `packages/weapp-tailwindcss/test/js-cache.test.ts` 单元测试
    - 测试空源码跳过缓存（直接执行转译）
    - 测试含 `error` 的结果不缓存（解析失败后再次调用仍重新解析）
    - 测试含 `linked` 的结果不缓存
    - 测试默认缓存上限为 512（≥ 256）
    - 测试 `classNameSet` 为 `undefined` 时正常工作
    - 测试大文件（>512 字符）也能被缓存
    - 测试携带 `filename`/`moduleGraph` 的调用也能命中缓存
    - 测试不同 `classNameSet` 引用不共享缓存
    - 测试相同输入第二次调用命中缓存返回相同结果
    - _Requirements: 1.1, 1.3, 1.4, 2.4, 3.1, 3.2, 3.3, 3.4, 5.4, 6.1_

- [ ] 4. 编写属性测试
  - [~]* 4.1 创建 `packages/weapp-tailwindcss/test/js-cache.property.test.ts` 并编写 Property 1
    - **Property 1: Content hash caching works for any source length**
    - 使用 fast-check 随机生成任意长度的非空 JS 源码字符串，调用 handler 两次，验证第二次返回与第一次相同的 `code` 输出
    - **Validates: Requirements 1.1, 1.3**

  - [~]* 4.2 编写 Property 2 属性测试
    - **Property 2: LRU eviction preserves recently accessed entries**
    - 创建 max=4 的小缓存，插入 4 个不同源码，访问前 2 个，再插入第 5 个，验证前 2 个仍命中缓存而第 3 或第 4 个被淘汰
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [~]* 4.3 编写 Property 3 属性测试
    - **Property 3: Bundler path calls are cacheable**
    - 随机生成非空源码，使用含 `filename` 的选项调用 handler 两次，验证第二次命中缓存（前提是第一次未产生 `linked` 或 `error`）
    - **Validates: Requirements 3.1, 3.2**

  - [~]* 4.4 编写 Property 4 属性测试
    - **Property 4: Options resolution reference stability**
    - 随机生成 `classNameSet` 和 `overrideOptions`，调用 `resolveOptions` 两次，验证返回同一对象引用（`===`）
    - **Validates: Requirements 4.2**

  - [~]* 4.5 编写 Property 5 属性测试
    - **Property 5: Backward-compatible output**
    - 随机生成有效 JS 源码和 classNameSet，验证优化后 handler 的 `code` 输出与直接调用 `jsHandler(rawSource, resolvedOptions)` 一致
    - **Validates: Requirements 5.1**

  - [~]* 4.6 编写 Property 6 属性测试
    - **Property 6: ClassNameSet identity isolation**
    - 随机生成源码，创建两个内容相同但引用不同的 `Set<string>`，分别调用 handler，验证第二个 Set 不命中第一个 Set 的缓存
    - **Validates: Requirements 6.1, 6.2**

- [x] 5. Final checkpoint - 全量验证
  - 运行 `pnpm --filter weapp-tailwindcss vitest run test/js.test.ts` 确保回归测试通过
  - 运行 `pnpm --filter weapp-tailwindcss vitest run test/js-cache.test.ts` 确保单元测试通过
  - 运行 `pnpm --filter weapp-tailwindcss vitest run test/js-cache.property.test.ts` 确保属性测试通过
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 所有变更集中在 `packages/weapp-tailwindcss/src/js/index.ts` 一个文件
- 复用已有依赖 `lru-cache` 和 `src/cache/md5.ts`，无需引入新包
- `jsPreserveClass` 为函数引用，不参与指纹序列化，通过 options 对象引用稳定性间接保证一致性
- `filename` 和 `moduleGraph` 不参与指纹计算，因为它们不影响单文件转译结果（仅影响 linked 分析）
- 含 `linked` 或 `error` 的结果不缓存，确保跨文件分析和解析错误不被错误复用
- 属性测试使用 fast-check 库，每个属性至少运行 100 次迭代
- 每个属性测试标注格式：**Feature: js-handler-cache-optimization, Property {number}: {property_text}**
