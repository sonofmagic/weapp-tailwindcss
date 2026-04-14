# Requirements Document

## Introduction

用户反馈 `@weapp-tailwindcss/merge`（依赖 tailwind-merge v3，ESM 产物约 100KB）和 `@weapp-tailwindcss/merge-v3`（依赖 tailwind-merge v2，ESM 产物约 72KB）在小程序环境中体积过大。tailwind-merge 的体积主要来自内置的 Tailwind CSS 类冲突分组默认配置（Default_Config），而非核心合并算法本身。

本需求提供三层体积优化方案，满足不同场景的需求：

1. **Full Entry（`.` 完整入口）**：包含完整 Default_Config，与当前行为一致，约 100KB（merge）/ 72KB（merge-v3）。
2. **Slim Entry（`/slim` 精简入口）**：内置精简版冲突分组配置，覆盖小程序场景中绝大部分常用 Tailwind 类，开箱即用无需额外配置，体积显著小于 Full Entry。
3. **Lite Entry（`/lite` 轻量入口）**：不包含任何 Default_Config，仅导出工厂函数，用户自行提供配置，体积最小（约 22-27KB）。

## Glossary

- **Merge_Package**: `@weapp-tailwindcss/merge` 包，基于 tailwind-merge v3 的小程序运行时封装
- **Merge_V3_Package**: `@weapp-tailwindcss/merge-v3` 包，基于 tailwind-merge v2 的小程序运行时封装
- **Runtime_Package**: `@weapp-tailwindcss/runtime` 包，提供 escape/unescape、rpx 转换等共享运行时能力
- **Default_Config**: tailwind-merge 内置的完整 Tailwind CSS 类冲突分组配置，是体积的主要来源
- **Slim_Config**: 精简版冲突分组配置，仅包含小程序场景中最常用的 Tailwind 类冲突分组子集
- **Full_Entry**: 包含完整 Default_Config 的入口，与当前行为一致（子路径 `.`）
- **Slim_Entry**: 包含 Slim_Config 的精简入口，开箱即用（子路径 `/slim`）
- **Lite_Entry**: 不包含任何冲突分组配置的轻量化入口，用户需自行提供配置（子路径 `/lite`）
- **Class_Conflict_Group**: tailwind-merge 中定义的类名冲突分组规则，用于判断哪些 Tailwind 类名之间存在冲突
- **RPX_Transform**: 将 rpx 单位的 arbitrary value 在 merge 前后进行转换的逻辑，确保 rpx 值被正确识别为长度类型
- **Escape_Unescape**: 小程序环境下对类名中特殊字符进行编码/解码的转换逻辑
- **LRU_Cache**: 有限大小（256 条目）的最近最少使用缓存，用于加速重复类名合并

## Requirements

### Requirement 1: 提供轻量化入口（Lite Entry）

**User Story:** 作为小程序开发者，我希望能引入一个不包含任何冲突分组配置的轻量化 merge 包，以便在对体积极度敏感的场景下获得最小的包体积。

#### Acceptance Criteria

1. THE Merge_Package SHALL export a Lite_Entry that does not bundle the Default_Config from tailwind-merge
2. THE Merge_V3_Package SHALL export a Lite_Entry that does not bundle the Default_Config from tailwind-merge
3. WHEN a consumer imports from the Lite_Entry, THE Lite_Entry SHALL provide `createTailwindMerge` and `extendTailwindMerge` factory functions that accept user-supplied configuration
4. WHEN a consumer imports from the Lite_Entry, THE Lite_Entry SHALL provide `twJoin` for class concatenation without conflict resolution
5. THE Lite_Entry SHALL re-export the `create` runtime factory with identical behavior to the Full_Entry (including RPX_Transform and Escape_Unescape)
6. THE Lite_Entry ESM bundle size SHALL be less than 20KB for the Merge_Package
7. THE Lite_Entry ESM bundle size SHALL be less than 15KB for the Merge_V3_Package

### Requirement 2: 提供精简入口（Slim Entry）

**User Story:** 作为小程序开发者，我希望能引入一个内置精简版冲突分组配置的 merge 包，覆盖绝大部分常用场景，无需额外配置即可使用，同时体积显著小于完整版。

#### Acceptance Criteria

1. THE Merge_Package SHALL export a Slim_Entry that bundles a Slim_Config covering the most common Tailwind class conflict groups used in mini-program scenarios
2. THE Merge_V3_Package SHALL export a Slim_Entry that bundles a Slim_Config covering the most common Tailwind class conflict groups used in mini-program scenarios
3. THE Slim_Config SHALL include conflict groups for the following high-frequency utility categories: display, position, visibility, overflow, z-index, flexbox (direction, wrap, grow, shrink, basis, order), grid (template columns/rows, gap), alignment (justify-content, align-items, align-self, place-content, place-items), spacing (padding, margin), sizing (width, height, min-width, min-height, max-width, max-height, size), typography (font-size, font-weight, font-family, text-align, text-color, line-height, letter-spacing, text-overflow, whitespace, word-break), backgrounds (background-color, background-image, background-size, background-position, background-repeat), borders (border-width, border-color, border-style, border-radius), effects (opacity, box-shadow), and transforms (translate, scale, rotate)
4. THE Slim_Config SHALL NOT include conflict groups for low-frequency utility categories such as: SVG-specific utilities, table layout utilities, scroll-snap utilities, touch-action utilities, mask utilities, perspective utilities, container queries, and other rarely used utilities in mini-program scenarios
5. WHEN a consumer imports from the Slim_Entry, THE Slim_Entry SHALL provide a pre-configured `twMerge` function that resolves conflicts using the Slim_Config
6. WHEN a consumer imports from the Slim_Entry, THE Slim_Entry SHALL provide `twJoin`, `extendTailwindMerge`, and `createTailwindMerge` functions
7. THE Slim_Entry ESM bundle size SHALL be less than 60KB for the Merge_Package
8. THE Slim_Entry ESM bundle size SHALL be less than 45KB for the Merge_V3_Package
9. WHEN a consumer uses `extendTailwindMerge` from the Slim_Entry, THE Slim_Entry SHALL allow extending the Slim_Config with additional conflict groups

### Requirement 3: 保持完整入口（Full Entry）向后兼容

**User Story:** 作为现有用户，我希望现有的导入路径和 API 行为完全不变，以便升级时无需修改任何代码。

#### Acceptance Criteria

1. THE Full_Entry SHALL continue to export `twMerge`, `twJoin`, `extendTailwindMerge`, `createTailwindMerge`, `getDefaultConfig`, `mergeConfigs`, `create`, `tailwindMergeVersion`, and `weappTwIgnore`
2. THE Full_Entry SHALL maintain identical merge conflict resolution behavior for all existing class patterns
3. THE Full_Entry SHALL maintain identical RPX_Transform behavior for arbitrary rpx values
4. THE Full_Entry SHALL maintain identical Escape_Unescape behavior for mini-program class names
5. THE Full_Entry SHALL maintain identical LRU_Cache behavior with a 256-entry limit

### Requirement 4: Lite Entry 的导出子路径配置

**User Story:** 作为小程序开发者，我希望通过清晰的子路径导入轻量化版本，以便在项目中明确区分完整版和轻量版。

#### Acceptance Criteria

1. THE Merge_Package SHALL expose the Lite_Entry via a `/lite` subpath export in package.json
2. THE Merge_V3_Package SHALL expose the Lite_Entry via a `/lite` subpath export in package.json
3. WHEN a consumer imports from the `/lite` subpath, THE package SHALL resolve to the Lite_Entry module with correct ESM and CJS entry points
4. WHEN a consumer imports from the `/lite` subpath, THE package SHALL provide correct TypeScript type declarations

### Requirement 5: Slim Entry 的导出子路径配置

**User Story:** 作为小程序开发者，我希望通过清晰的子路径导入精简版本，以便在项目中明确区分三个层级的入口。

#### Acceptance Criteria

1. THE Merge_Package SHALL expose the Slim_Entry via a `/slim` subpath export in package.json
2. THE Merge_V3_Package SHALL expose the Slim_Entry via a `/slim` subpath export in package.json
3. WHEN a consumer imports from the `/slim` subpath, THE package SHALL resolve to the Slim_Entry module with correct ESM and CJS entry points
4. WHEN a consumer imports from the `/slim` subpath, THE package SHALL provide correct TypeScript type declarations

### Requirement 6: Lite Entry 与 Slim Entry 的运行时封装一致性

**User Story:** 作为小程序开发者，我希望所有入口的运行时封装行为（escape/unescape、rpx 转换、缓存）完全一致，以便仅通过配置差异来控制体积。

#### Acceptance Criteria

1. THE Lite_Entry SHALL apply Escape_Unescape transformations identically to the Full_Entry
2. THE Slim_Entry SHALL apply Escape_Unescape transformations identically to the Full_Entry
3. THE Lite_Entry SHALL apply RPX_Transform identically to the Full_Entry
4. THE Slim_Entry SHALL apply RPX_Transform identically to the Full_Entry
5. THE Lite_Entry SHALL use the same LRU_Cache strategy (256-entry limit, FIFO eviction) as the Full_Entry
6. THE Slim_Entry SHALL use the same LRU_Cache strategy (256-entry limit, FIFO eviction) as the Full_Entry
7. WHEN a user creates a runtime via the Lite_Entry `create` factory with a custom config, THE runtime SHALL produce merge results consistent with tailwind-merge using the same config
8. WHEN a user creates a runtime via the Slim_Entry `create` factory, THE runtime SHALL produce merge results consistent with tailwind-merge using the Slim_Config
9. THE Lite_Entry SHALL support the same `CreateOptions` (escape, unescape configuration) as the Full_Entry
10. THE Slim_Entry SHALL support the same `CreateOptions` (escape, unescape configuration) as the Full_Entry

### Requirement 7: Lite Entry 不导出 Default_Config 相关符号

**User Story:** 作为小程序开发者，我希望轻量化入口不包含任何默认配置相关的导出，以确保 tree-shaking 能彻底移除默认配置代码。

#### Acceptance Criteria

1. THE Lite_Entry SHALL NOT export `twMerge` (the pre-configured merge function that depends on Default_Config)
2. THE Lite_Entry SHALL NOT export `getDefaultConfig`
3. THE Lite_Entry SHALL NOT export `mergeConfigs`
4. WHEN a bundler performs tree-shaking on the Lite_Entry, THE resulting bundle SHALL NOT contain the Default_Config class conflict group definitions

### Requirement 8: Slim Entry 不导出完整 Default_Config 相关符号

**User Story:** 作为小程序开发者，我希望精简入口不暴露完整版的默认配置符号，以确保 tree-shaking 能移除完整配置代码，仅保留精简配置。

#### Acceptance Criteria

1. THE Slim_Entry SHALL NOT export `getDefaultConfig` (the full default config getter)
2. THE Slim_Entry SHALL NOT export `mergeConfigs`
3. THE Slim_Entry SHALL export `getSlimConfig` for consumers who need to inspect or extend the Slim_Config programmatically
4. WHEN a bundler performs tree-shaking on the Slim_Entry, THE resulting bundle SHALL NOT contain the full Default_Config class conflict group definitions

### Requirement 9: 类型声明完整性

**User Story:** 作为 TypeScript 用户，我希望所有入口提供完整的类型声明，以便获得一致的开发体验。

#### Acceptance Criteria

1. THE Lite_Entry SHALL export TypeScript type declarations for `ClassValue`, `CreateOptions`, `EscapeConfig`, and `UnescapeConfig`
2. THE Slim_Entry SHALL export TypeScript type declarations for `ClassValue`, `CreateOptions`, `EscapeConfig`, and `UnescapeConfig`
3. THE Lite_Entry SHALL export correctly typed `createTailwindMerge` and `extendTailwindMerge` factory functions
4. THE Slim_Entry SHALL export correctly typed `twMerge`, `twJoin`, `createTailwindMerge`, and `extendTailwindMerge` functions
5. THE Lite_Entry type declarations SHALL pass `tsd` type checking without errors
6. THE Slim_Entry type declarations SHALL pass `tsd` type checking without errors
