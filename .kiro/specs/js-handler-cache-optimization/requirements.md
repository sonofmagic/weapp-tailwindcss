# Requirements Document

## Introduction

优化 `createJsHandler`（位于 `packages/weapp-tailwindcss/src/js/index.ts`）的结果缓存策略。当前实现存在四个核心缺陷：512 字符上限导致大文件永远不缓存、FIFO 淘汰策略导致高频文件被低频文件驱逐、bundler 路径（含 `filename`/`moduleGraph`）完全跳过结果缓存、以及 4 层 WeakMap 嵌套使缓存逻辑难以推理。本次优化旨在引入基于内容哈希的缓存键、LRU 淘汰策略、bundler 路径缓存支持，并简化选项解析缓存层级，同时保持输入输出的向后兼容性。

## Glossary

- **JsHandler**: `createJsHandler` 返回的函数，接收原始 JS 源码、类名集合和可选配置，返回转译后的代码
- **Result_Cache**: JsHandler 内部用于缓存转译结果的数据结构，避免对相同输入重复执行 Babel 解析与转译
- **Content_Hash**: 对源码内容计算的哈希摘要（如 MD5），用作缓存键以替代原始源码字符串
- **LRU_Cache**: 最近最少使用（Least Recently Used）淘汰策略的缓存，优先保留高频访问条目
- **Options_Fingerprint**: 将 `IJsHandlerOptions` 中影响转译结果的字段序列化为唯一标识符，用于区分不同配置下的缓存条目
- **Bundler_Path**: 构建工具（Webpack/Vite/Gulp）调用 JsHandler 时携带 `filename` 和/或 `moduleGraph` 的执行路径
- **Standalone_Path**: 不携带 `filename` 和 `moduleGraph` 的独立调用路径（如 `createContext.transformJs` 的非 bundler 场景）
- **FIFO**: 先进先出（First In First Out）淘汰策略，当前实现中缓存满时删除最早插入的条目
- **ClassNameSet**: 由 `tailwindcss-patch` 提供的类名集合，JsHandler 仅转译该集合中的类名

## Requirements

### Requirement 1: 基于内容哈希的缓存键

**User Story:** As a 使用 bundler 的开发者, I want JsHandler 使用内容哈希而非原始源码字符串作为缓存键, so that 大文件也能被缓存且内存占用更低。

#### Acceptance Criteria

1. WHEN 原始源码长度超过 0 个字符, THE Result_Cache SHALL 使用 Content_Hash 作为缓存查找键，而非原始源码字符串
2. WHEN 两段不同的源码产生相同的 Content_Hash, THE Result_Cache SHALL 返回缓存的转译结果（哈希碰撞概率在 MD5 下可接受）
3. THE Result_Cache SHALL 对任意长度的源码执行缓存查找，不设置源码长度上限
4. WHEN 源码长度为 0, THE Result_Cache SHALL 跳过缓存查找并直接执行转译

### Requirement 2: LRU 淘汰策略

**User Story:** As a 在 HMR 场景下频繁编辑文件的开发者, I want 缓存使用 LRU 淘汰策略, so that 频繁访问的文件不会被偶尔访问的文件驱逐。

#### Acceptance Criteria

1. THE Result_Cache SHALL 使用 LRU 淘汰策略替代 FIFO 淘汰策略
2. WHEN 缓存条目数达到上限, THE Result_Cache SHALL 淘汰最近最少使用的条目
3. WHEN 访问一个已缓存的条目, THE Result_Cache SHALL 将该条目标记为最近使用
4. THE Result_Cache SHALL 支持可配置的最大条目数，默认值不低于 256

### Requirement 3: Bundler 路径缓存支持

**User Story:** As a 使用 Webpack/Vite 构建的开发者, I want 携带 filename/moduleGraph 的调用也能命中结果缓存, so that HMR 时相同内容的文件不需要重复执行 Babel 解析。

#### Acceptance Criteria

1. WHEN 调用选项包含 `filename` 或 `moduleGraph`, THE Result_Cache SHALL 仍然执行缓存查找，而非直接跳过
2. WHEN Bundler_Path 调用的源码 Content_Hash 与 Options_Fingerprint 组合命中缓存, THE Result_Cache SHALL 返回缓存的转译结果
3. WHEN 转译结果包含 `linked` 字段（跨文件分析结果）, THE Result_Cache SHALL 跳过缓存存储，因为 linked 结果依赖外部模块状态
4. WHEN 转译结果包含 `error` 字段, THE Result_Cache SHALL 跳过缓存存储

### Requirement 4: 选项解析缓存简化

**User Story:** As a 维护该代码库的开发者, I want 选项解析缓存层级从 4 层 WeakMap 简化为更扁平的结构, so that 缓存逻辑更容易理解和调试。

#### Acceptance Criteria

1. THE JsHandler SHALL 将 `resolvedOptionsByClassNameSet`、`resolvedOverrideOptions`、`resolvedOverrideOptionsByClassNameSet` 合并为不超过 2 层的缓存结构
2. THE JsHandler SHALL 保持选项解析的引用稳定性：对相同的 `classNameSet` 和 `overrideOptions` 输入，返回同一个 `IJsHandlerOptions` 对象引用
3. THE JsHandler SHALL 使用 Options_Fingerprint 将选项配置映射到缓存分区，替代多层 WeakMap 嵌套

### Requirement 5: 向后兼容性

**User Story:** As a 现有用户, I want 缓存策略优化不改变转译的输入输出行为, so that 升级后不需要修改任何业务代码。

#### Acceptance Criteria

1. THE JsHandler SHALL 对相同的 `rawSource`、`classNameSet` 和 `options` 输入产生与优化前完全相同的 `code` 输出
2. THE JsHandler SHALL 保持与现有 `JsHandler` 类型签名 `(rawSource: string, set?: Set<string>, options?: CreateJsHandlerOptions) => JsHandlerResult` 的兼容
3. THE JsHandler SHALL 保持 `createJsHandler(options: CreateJsHandlerOptions): JsHandler` 的工厂函数签名不变
4. WHEN `classNameSet` 为 `undefined`, THE JsHandler SHALL 与优化前行为一致，正常执行转译
5. THE JsHandler SHALL 确保所有现有单元测试（`test/js.test.ts`）在优化后继续通过

### Requirement 6: 缓存与 ClassNameSet 变更的一致性

**User Story:** As a 开发者, I want 当 ClassNameSet 发生变化时缓存不会返回过期结果, so that 转译结果始终基于最新的类名集合。

#### Acceptance Criteria

1. WHEN ClassNameSet 引用发生变化, THE Result_Cache SHALL 不返回基于旧 ClassNameSet 的缓存结果
2. THE Options_Fingerprint SHALL 包含 ClassNameSet 的身份标识（如对象引用或内容签名），确保不同 ClassNameSet 对应不同的缓存分区
3. WHEN 同一个 ClassNameSet 引用的内容被外部修改, THE Result_Cache SHALL 依赖调用方提供新的 ClassNameSet 引用来触发缓存失效（与当前行为一致）
