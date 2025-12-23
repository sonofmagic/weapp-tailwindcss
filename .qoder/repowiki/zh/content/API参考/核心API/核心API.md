# 核心API

<cite>
**本文档中引用的文件**  
- [core.ts](file://packages/weapp-tailwindcss/src/core.ts#L13-L75)
- [typedoc.export.ts](file://packages/weapp-tailwindcss/src/typedoc.export.ts#L14-L555)
- [vite/index.ts](file://packages/weapp-tailwindcss/src/bundlers/vite/index.ts#L134-L477)
- [webpack/index.ts](file://packages/weapp-tailwindcss/src/bundlers/webpack/index.ts#L1-L2)
- [index.ts](file://packages/weapp-tailwindcss/src/index.ts#L1-L5)
</cite>

## 目录
1. [简介](#简介)
2. [核心函数](#核心函数)
3. [核心数据结构](#核心数据结构)
4. [工作流程](#工作流程)
5. [调用关系与协作](#调用关系与协作)
6. [异常处理机制](#异常处理机制)
7. [实际使用示例](#实际使用示例)

## 简介

`weapp-tailwindcss` 是一个为小程序开发者提供 Tailwind CSS 原子化样式能力的工具库。它通过将 Tailwind CSS 的工具类转换为小程序可识别的类名，实现了在小程序环境中使用现代 CSS 框架的能力。本 API 文档重点介绍 `createContext`、`process` 和 `build` 等主要函数的实现细节和使用模式，详细说明每个函数的参数类型、返回值、异常处理机制和调用关系。

**Section sources**
- [README.md](file://packages/weapp-tailwindcss/README.md#L1-L101)

## 核心函数

### createContext

`createContext` 函数用于创建一个上下文对象，该对象包含处理小程序模板、样式和脚本转换所需的方法。它是整个 API 的入口点。

```mermaid
classDiagram
class Context {
+transformWxss(rawCss : string, options? : Partial~IStyleHandlerOptions~) : Promise~string~
+transformWxml(rawWxml : string, options? : ITemplateHandlerOptions) : Promise~string~
+transformJs(rawJs : string, options : { runtimeSet? : Set~string~ } & CreateJsHandlerOptions) : Promise~string~
}
```

**Diagram sources**
- [core.ts](file://packages/weapp-tailwindcss/src/core.ts#L13-L75)

**Section sources**
- [core.ts](file://packages/weapp-tailwindcss/src/core.ts#L13-L75)

### process

`process` 函数用于处理单个文件的内容，根据文件类型调用相应的转换方法。它通常在构建过程中被调用，以处理每个文件。

**Section sources**
- [vite/index.ts](file://packages/weapp-tailwindcss/src/bundlers/vite/index.ts#L134-L477)

### build

`build` 函数用于构建整个项目，它会遍历项目中的所有文件，并调用 `process` 函数处理每个文件。它是构建过程的入口点。

**Section sources**
- [webpack/index.ts](file://packages/weapp-tailwindcss/src/bundlers/webpack/index.ts#L1-L2)

## 核心数据结构

### Context

`Context` 是 `createContext` 函数返回的对象，包含三个主要方法：`transformWxss`、`transformWxml` 和 `transformJs`。这些方法分别用于处理样式、模板和脚本文件。

**Section sources**
- [core.ts](file://packages/weapp-tailwindcss/src/core.ts#L13-L75)

### Config

`Config` 是用户定义的配置对象，用于控制 `weapp-tailwindcss` 的行为。它包含多个可选属性，如 `disabled`、`customAttributes`、`cssPreflight` 等。

```mermaid
classDiagram
class UserDefinedOptions {
+disabled? : boolean | DisabledOptions
+customAttributes? : ICustomAttributes
+cssPreflight? : CssPreflightOptions
+cssCalc? : boolean | CssCalcOptions | (string | RegExp)[]
+injectAdditionalCssVarScope? : boolean
+rewriteCssImports? : boolean
+cssSelectorReplacement? : {
root? : string | string[] | false
universal? : string | string[] | false
}
+rem2rpx? : boolean | Rem2rpxOptions
+px2rpx? : boolean | Px2rpxOptions
+cssPresetEnv? : PresetEnvOptions
+tailwindcss? : TailwindcssPatchOptions['tailwind']
+cssEntries? : string[]
+uniAppX? : boolean
+htmlMatcher? : (name : string) => boolean
+cssMatcher? : (name : string) => boolean
+jsMatcher? : (name : string) => boolean
+mainCssChunkMatcher? : (name : string, appType? : AppType) => boolean
+wxsMatcher? : (name : string) => boolean
+inlineWxs? : boolean
+onLoad? : () => void
+onStart? : () => void
+onUpdate? : (filename : string, oldVal : string, newVal : string) => void
+onEnd? : () => void
+supportCustomLengthUnitsPatch? : ILengthUnitsPatchOptions | boolean
+appType? : AppType
+arbitraryValues? : IArbitraryValues
+jsPreserveClass? : (keyword : string) => boolean | undefined
+disabledDefaultTemplateHandler? : boolean
+runtimeLoaderPath? : string
+runtimeCssImportRewriteLoaderPath? : string
+tailwindcssBasedir? : string
+cache? : boolean | ICreateCacheReturnType
+babelParserOptions? : ParserOptions & { cache? : boolean, cacheKey? : string }
+cssChildCombinatorReplaceValue? : string | string[]
+postcssOptions? : LoadedPostcssOptions
+cssRemoveHoverPseudoClass? : boolean
+cssRemoveProperty? : boolean
+tailwindcssPatcherOptions? : TailwindcssPatchOptions
+logLevel? : 'info' | 'warn' | 'error' | 'silent'
}
```

**Diagram sources**
- [typedoc.export.ts](file://packages/weapp-tailwindcss/src/typedoc.export.ts#L14-L555)

**Section sources**
- [typedoc.export.ts](file://packages/weapp-tailwindcss/src/typedoc.export.ts#L14-L555)

### Options

`Options` 是传递给各个转换方法的选项对象，用于控制转换过程中的具体行为。

**Section sources**
- [typedoc.export.ts](file://packages/weapp-tailwindcss/src/typedoc.export.ts#L14-L555)

## 工作流程

1. **初始化上下文**：调用 `createContext` 函数，传入用户定义的配置对象，创建一个上下文对象。
2. **处理样式**：调用 `transformWxss` 方法，传入原始 CSS 代码和选项对象，处理样式文件。
3. **处理模板**：调用 `transformWxml` 方法，传入原始 WXML 代码和选项对象，处理模板文件。
4. **处理脚本**：调用 `transformJs` 方法，传入原始 JS 代码和选项对象，处理脚本文件。
5. **生成输出**：将处理后的代码写入输出文件。

**Section sources**
- [core.ts](file://packages/weapp-tailwindcss/src/core.ts#L13-L75)

## 调用关系与协作

`createContext` 函数创建的上下文对象中的各个方法相互协作，共同完成小程序的构建过程。`transformWxss`、`transformWxml` 和 `transformJs` 方法分别处理不同类型的文件，它们共享同一个运行时状态，确保类名的一致性。

**Section sources**
- [core.ts](file://packages/weapp-tailwindcss/src/core.ts#L13-L75)

## 异常处理机制

`weapp-tailwindcss` 通过 Promise 和 async/await 机制处理异步操作中的异常。在转换过程中，如果发生错误，会抛出相应的异常，开发者可以通过 try-catch 语句捕获并处理这些异常。

**Section sources**
- [core.ts](file://packages/weapp-tailwindcss/src/core.ts#L13-L75)

## 实际使用示例

以下是一个使用 `weapp-tailwindcss` 的实际示例：

```typescript
import { createContext } from 'weapp-tailwindcss/core';

const context = createContext({
  disabled: false,
  customAttributes: {
    '*': [/[A-Za-z]?[A-Za-z-]*[Cc]lass/],
    'van-image': ['custom-class'],
    'ice-button': ['testClass'],
  },
  cssPreflight: {
    'box-sizing': 'border-box',
    'border-width': '0',
    'border-style': 'solid',
    'border-color': 'currentColor',
  },
});

const transformedWxss = await context.transformWxss('.text-red-500 { color: red; }');
const transformedWxml = await context.transformWxml('<view class="text-red-500">Hello</view>');
const transformedJs = await context.transformJs('const className = "text-red-500";');
```

**Section sources**
- [core.ts](file://packages/weapp-tailwindcss/src/core.ts#L13-L75)