# Requirements Document

## Introduction

当前 JS 快速预检查机制（`shouldSkipViteJsTransform`）仅在 Vite 构建路径中使用，通过正则快速判断 JS 文件是否需要转换，从而跳过不必要的 Babel AST 解析。本特性将该预检查逻辑从 Vite 专属位置迁移到共享模块，并集成到 Webpack v4、Webpack v5、Gulp 以及核心 `createContext().transformJs()` 路径中，以统一提升所有构建器的 JS 转译性能。

## Glossary

- **Precheck_Module**: 共享的 JS 预检查模块，包含判断是否可跳过 JS 转换的核心逻辑
- **JS_Handler**: 基于 Babel AST 的 JS 转译处理器，负责类名转义和模块说明符替换
- **Bundler_Path**: 各构建工具（Vite、Webpack v4、Webpack v5、Gulp）的集成层代码路径
- **Core_API**: `createContext()` 返回的 `transformJs` 方法，供用户直接调用
- **CreateJsHandlerOptions**: JS 处理器的配置选项类型，包含 `alwaysEscape`、`moduleSpecifierReplacements`、`wrapExpression` 等字段
- **FAST_JS_TRANSFORM_HINT_RE**: 用于检测源码中是否包含类名相关模式的正则表达式
- **DEPENDENCY_HINT_RE**: 用于检测源码中是否包含 import/export/require 语句的正则表达式

## Requirements

### Requirement 1: 将预检查逻辑迁移到共享模块

**User Story:** As a 维护者, I want 预检查逻辑位于所有构建器均可访问的共享位置, so that 各构建路径可以复用同一份预检查实现而无需重复代码。

#### Acceptance Criteria

1. THE Precheck_Module SHALL 从 `src/bundlers/vite/js-precheck.ts` 迁移到 `src/js/` 或 `src/bundlers/shared/` 目录下的共享模块
2. THE Precheck_Module SHALL 导出一个通用的预检查函数，接受源码字符串和可选的 `CreateJsHandlerOptions` 参数
3. WHEN Vite Bundler_Path 调用预检查函数时, THE Precheck_Module SHALL 返回与迁移前完全一致的结果
4. THE Precheck_Module SHALL 保留原有的 `FAST_JS_TRANSFORM_HINT_RE` 和 `DEPENDENCY_HINT_RE` 正则表达式逻辑

### Requirement 2: 预检查的保守跳过策略

**User Story:** As a 开发者, I want 预检查在不确定时不跳过转换, so that 不会因误判而遗漏需要转译的文件。

#### Acceptance Criteria

1. WHEN 源码为空字符串时, THE Precheck_Module SHALL 判定为可跳过转换
2. WHEN `CreateJsHandlerOptions.alwaysEscape` 为 `true` 时, THE Precheck_Module SHALL 判定为不可跳过转换
3. WHEN `CreateJsHandlerOptions.moduleSpecifierReplacements` 包含至少一个条目时, THE Precheck_Module SHALL 判定为不可跳过转换
4. WHEN `CreateJsHandlerOptions.wrapExpression` 为 `true` 时, THE Precheck_Module SHALL 判定为不可跳过转换
5. WHEN 源码匹配 DEPENDENCY_HINT_RE（包含 import/export/require 语句）时, THE Precheck_Module SHALL 判定为不可跳过转换
6. WHEN 源码匹配 FAST_JS_TRANSFORM_HINT_RE（包含类名相关模式）时, THE Precheck_Module SHALL 判定为不可跳过转换
7. WHEN 源码不匹配任何上述条件时, THE Precheck_Module SHALL 判定为可跳过转换

### Requirement 3: 集成到 Webpack v5 构建路径

**User Story:** As a 使用 Webpack v5 的开发者, I want JS 预检查在 Webpack v5 资产处理阶段生效, so that 不需要转换的 JS 文件可以跳过昂贵的 Babel 解析。

#### Acceptance Criteria

1. WHEN Webpack v5 的 `processAssets` 钩子处理 JS 资产时, THE Bundler_Path SHALL 在调用 JS_Handler 之前执行预检查
2. WHEN 预检查判定某 JS 资产可跳过时, THE Bundler_Path SHALL 跳过该资产的 Babel 转译并保留原始源码
3. WHEN 预检查判定某 JS 资产不可跳过时, THE Bundler_Path SHALL 正常执行 Babel 转译流程
4. THE Bundler_Path SHALL 将当前资产的 `CreateJsHandlerOptions`（包含 `staleClassNameFallback`、`tailwindcssMajorVersion`、`filename`、`moduleGraph` 等）传递给预检查函数

### Requirement 4: 集成到 Webpack v4 构建路径

**User Story:** As a 使用 Webpack v4 的开发者, I want JS 预检查在 Webpack v4 emit 阶段生效, so that 不需要转换的 JS 文件可以跳过昂贵的 Babel 解析。

#### Acceptance Criteria

1. WHEN Webpack v4 的 `emit` 钩子处理 JS 资产时, THE Bundler_Path SHALL 在调用 JS_Handler 之前执行预检查
2. WHEN 预检查判定某 JS 资产可跳过时, THE Bundler_Path SHALL 跳过该资产的 Babel 转译并保留原始源码
3. WHEN 预检查判定某 JS 资产不可跳过时, THE Bundler_Path SHALL 正常执行 Babel 转译流程

### Requirement 5: 集成到 Gulp 构建路径

**User Story:** As a 使用 Gulp 的开发者, I want JS 预检查在 Gulp 流式处理阶段生效, so that 不需要转换的 JS 文件可以跳过昂贵的 Babel 解析。

#### Acceptance Criteria

1. WHEN Gulp 的 `transformJs` 流处理 JS 文件时, THE Bundler_Path SHALL 在调用 JS_Handler 之前执行预检查
2. WHEN 预检查判定某 JS 文件可跳过时, THE Bundler_Path SHALL 跳过该文件的 Babel 转译并保留原始源码
3. WHEN 预检查判定某 JS 文件不可跳过时, THE Bundler_Path SHALL 正常执行 Babel 转译流程

### Requirement 6: 集成到核心 `createContext().transformJs()` API

**User Story:** As a 直接使用核心 API 的开发者, I want JS 预检查在 `transformJs` 调用时生效, so that 不需要转换的 JS 源码可以跳过昂贵的 Babel 解析。

#### Acceptance Criteria

1. WHEN 用户调用 `createContext().transformJs()` 时, THE Core_API SHALL 在调用 JS_Handler 之前执行预检查
2. WHEN 预检查判定源码可跳过时, THE Core_API SHALL 返回未修改的原始源码
3. WHEN 预检查判定源码不可跳过时, THE Core_API SHALL 正常执行 Babel 转译流程

### Requirement 7: 向后兼容性

**User Story:** As a 现有用户, I want 预检查扩展不改变任何需要转换的文件的输出结果, so that 升级后不会出现回归问题。

#### Acceptance Criteria

1. FOR ALL 包含 `className`、`classList`、`twMerge`、`clsx`、`classnames`、`cn`、`cva` 等类名相关模式的 JS 源码, THE Precheck_Module SHALL 判定为不可跳过
2. FOR ALL 包含 `import`、`export`、`require` 语句的 JS 源码, THE Precheck_Module SHALL 判定为不可跳过（因可能需要模块说明符替换）
3. FOR ALL 包含 Tailwind CSS 任意值语法（如 `text-[`、`bg-[`）的 JS 源码, THE Precheck_Module SHALL 判定为不可跳过
4. THE Precheck_Module SHALL 对 Vite 路径产生与迁移前完全一致的跳过/不跳过判定结果（round-trip 等价性）

### Requirement 8: 环境变量控制预检查开关

**User Story:** As a 开发者, I want 通过环境变量禁用预检查, so that 在调试时可以强制所有文件走完整转译流程。

#### Acceptance Criteria

1. WHILE 环境变量 `WEAPP_TW_DISABLE_JS_PRECHECK` 设置为 `'1'` 时, THE Precheck_Module SHALL 对所有源码判定为不可跳过
2. WHEN 环境变量未设置或为其他值时, THE Precheck_Module SHALL 正常执行预检查逻辑
