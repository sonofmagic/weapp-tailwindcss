# Requirements Document

## Introduction

`@weapp-tailwindcss/postcss` 的 `createStylePipeline` 当前总是加载全部 Normal 阶段插件（postcss-preset-env、color-functional-fallback 等），即使 CSS 内容并不需要这些转换。本特性引入一个轻量级 CSS 内容探测层（Content Probe），在构建流水线时根据 CSS 内容特征按需裁剪 Normal 阶段插件，减少不必要的 AST 遍历，同时保持完全向后兼容。

## Glossary

- **Pipeline**: `createStylePipeline` 函数构建的 PostCSS 插件流水线，分为 Pre、Normal、Post 三个阶段
- **Content_Probe**: 新增的轻量级 CSS 内容探测模块，通过正则或字符串匹配快速判断 CSS 是否包含特定特征
- **Normal_Stage**: 流水线中间阶段，包含 postcss-preset-env、color-functional-fallback、units-to-px、px-transform、rem-transform、calc、calc-duplicate-cleaner、custom-property-cleaner 等插件
- **Feature_Signal**: Content_Probe 对 CSS 内容检测后产出的布尔标志集合，表示哪些特征存在于当前 CSS 中
- **Processor_Cache**: `StyleProcessorCache` 类，负责缓存 PostCSS Processor 实例以避免重复创建
- **Options_Fingerprint**: 基于选项对象生成的字符串指纹，用于缓存键

## Requirements

### Requirement 1: CSS 内容特征探测

**User Story:** 作为框架开发者，我希望在构建流水线前快速探测 CSS 内容特征，以便决定哪些插件可以跳过。

#### Acceptance Criteria

1. THE Content_Probe SHALL 提供一个函数，接收 CSS 字符串并返回 Feature_Signal 对象
2. THE Content_Probe SHALL 检测 CSS 中是否包含现代颜色函数语法（如 `rgb(r g b / a)` 空格分隔写法），并在 Feature_Signal 中设置 `hasModernColorFunction` 标志
3. THE Content_Probe SHALL 检测 CSS 中是否包含需要 postcss-preset-env 处理的特征（如 `:is()` 伪类、`oklab()`/`oklch()` 颜色函数、`color-mix()`、`cascade layers`），并在 Feature_Signal 中设置 `hasPresetEnvFeatures` 标志
4. THE Content_Probe SHALL 仅使用字符串方法或正则表达式进行检测，不进行 AST 解析
5. WHEN CSS 内容为空字符串时, THE Content_Probe SHALL 返回所有标志均为 false 的 Feature_Signal

### Requirement 2: 按需裁剪 Normal 阶段插件

**User Story:** 作为框架开发者，我希望流水线根据 CSS 内容特征跳过不需要的插件，以减少 AST 遍历次数。

#### Acceptance Criteria

1. WHEN Feature_Signal 的 `hasPresetEnvFeatures` 为 false 时, THE Pipeline SHALL 跳过 postcss-preset-env 插件
2. WHEN Feature_Signal 的 `hasModernColorFunction` 为 false 时, THE Pipeline SHALL 跳过 color-functional-fallback 插件
3. WHEN 插件因内容探测被跳过时, THE Pipeline SHALL 不在 nodes 列表中包含该插件的节点
4. THE Pipeline SHALL 保持现有的基于选项的条件加载逻辑不变（units-to-px、px-transform、rem-transform、calc、calc-duplicate-cleaner、custom-property-cleaner 仍由选项控制）
5. THE Pipeline SHALL 保持 Pre 阶段和 Post 阶段插件始终加载，不受内容探测影响

### Requirement 3: 内容感知的处理器缓存

**User Story:** 作为框架开发者，我希望缓存层能区分不同内容特征组合对应的处理器，以避免缓存命中错误的流水线。

#### Acceptance Criteria

1. THE Processor_Cache SHALL 将 Feature_Signal 纳入处理器缓存键的计算
2. WHEN 两次调用使用相同选项但不同 Feature_Signal 时, THE Processor_Cache SHALL 返回不同的 Processor 实例
3. WHEN 两次调用使用相同选项和相同 Feature_Signal 时, THE Processor_Cache SHALL 返回同一个 Processor 实例
4. THE Processor_Cache SHALL 保持现有的基于选项指纹的缓存逻辑不变

### Requirement 4: 处理入口集成

**User Story:** 作为框架开发者，我希望样式处理入口自动执行内容探测并传递给流水线，无需调用方修改代码。

#### Acceptance Criteria

1. WHEN `createStyleHandler` 返回的处理函数被调用时, THE StyleHandler SHALL 自动对输入的 CSS 字符串执行 Content_Probe 探测
2. THE StyleHandler SHALL 将探测得到的 Feature_Signal 传递给 Processor_Cache 用于获取正确的处理器
3. THE StyleHandler SHALL 保持现有的公开 API 签名不变，调用方无需传递额外参数
4. IF Content_Probe 探测过程发生异常, THEN THE StyleHandler SHALL 回退到加载全部插件的行为

### Requirement 5: 向后兼容性保证

**User Story:** 作为框架使用者，我希望升级后现有行为完全不变，不需要修改任何配置。

#### Acceptance Criteria

1. THE Pipeline SHALL 对包含所有特征的 CSS 内容产出与裁剪前完全相同的处理结果
2. THE Pipeline SHALL 保持 `getPipeline` 方法的返回类型 `StyleProcessingPipeline` 不变
3. THE Pipeline SHALL 保持 `getPlugins` 兼容函数的行为不变
4. WHEN 外部消费方（如 `@weapp-tailwindcss/weapp-tailwindcss`）通过 `createStyleHandler` 创建处理器时, THE StyleHandler SHALL 无需任何配置变更即可获得按需裁剪能力

### Requirement 6: 探测准确性保证

**User Story:** 作为框架开发者，我希望内容探测宁可多加载插件也不遗漏，确保处理结果正确。

#### Acceptance Criteria

1. THE Content_Probe SHALL 采用宽松匹配策略：当无法确定是否需要某插件时，对应标志 SHALL 为 true
2. WHEN CSS 内容包含注释中的特征关键字时, THE Content_Probe SHALL 将对应标志设为 true（允许误报，禁止漏报）
3. FOR ALL 有效 CSS 输入, 使用裁剪后流水线处理的结果 SHALL 与使用完整流水线处理的结果完全一致（等价性属性）
