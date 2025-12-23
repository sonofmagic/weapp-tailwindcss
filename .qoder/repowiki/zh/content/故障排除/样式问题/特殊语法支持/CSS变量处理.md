# CSS变量处理

<cite>
**本文档引用的文件**  
- [cssVarsV3.ts](file://packages/postcss/src/cssVarsV3.ts)
- [cssVarsV4.ts](file://packages/postcss/src/cssVarsV4.ts)
- [css-vars.ts](file://packages/postcss/src/utils/css-vars.ts)
- [get-decl.ts](file://packages/weapp-tailwindcss/scripts/get-decl.ts)
- [options-a2565187.mjs](file://demo/gulp-app/weapp-tw-dist/options-a2565187.mjs)
</cite>

## 目录
1. [简介](#简介)
2. [CSS变量处理机制](#css变量处理机制)
3. [编译时替换模式](#编译时替换模式)
4. [运行时注入模式](#运行时注入模式)
5. [作用域与继承行为](#作用域与继承行为)
6. [主题切换应用](#主题切换应用)
7. [多平台兼容性解决方案](#多平台兼容性解决方案)
8. [总结](#总结)

## 简介
weapp-tailwindcss 提供了一套完整的CSS自定义属性（CSS变量）处理方案，旨在将Tailwind CSS的变量系统适配到小程序环境。该方案支持编译时替换和运行时注入两种模式，确保在不同小程序平台（微信、支付宝、字节等）上的兼容性和性能优化。

## CSS变量处理机制
weapp-tailwindcss 通过PostCSS插件系统处理CSS变量，主要涉及以下几个核心文件：
- `cssVarsV3.ts` 和 `cssVarsV4.ts`：定义了Tailwind CSS v3和v4版本的默认CSS变量集。
- `css-vars.ts`：提供了将CSS变量定义转换为可直接插入的Declaration节点列表的工具函数。
- `get-decl.ts`：用于生成和更新CSS变量声明的脚本。

这些文件共同构成了weapp-tailwindcss的CSS变量处理基础，确保了变量的正确解析和应用。

**Section sources**
- [cssVarsV3.ts](file://packages/postcss/src/cssVarsV3.ts)
- [cssVarsV4.ts](file://packages/postcss/src/cssVarsV4.ts)
- [css-vars.ts](file://packages/postcss/src/utils/css-vars.ts)
- [get-decl.ts](file://packages/weapp-tailwindcss/scripts/get-decl.ts)

## 编译时替换模式
编译时替换模式是指在构建过程中，将Tailwind CSS的变量直接替换为具体的CSS值。这种方式可以减少运行时的计算开销，提高性能。具体实现如下：
1. **变量定义**：在`cssVarsV3.ts`和`cssVarsV4.ts`中定义了所有需要替换的变量。
2. **变量替换**：通过PostCSS插件在编译阶段将变量引用替换为实际值。
3. **输出优化**：生成的CSS文件中不再包含变量声明，直接使用具体的CSS值。

这种模式适用于大多数静态样式需求，能够显著提升小程序的加载速度和渲染性能。

**Section sources**
- [cssVarsV3.ts](file://packages/postcss/src/cssVarsV3.ts)
- [cssVarsV4.ts](file://packages/postcss/src/cssVarsV4.ts)

## 运行时注入模式
运行时注入模式是指在小程序运行时动态注入CSS变量。这种方式适用于需要动态改变样式的场景，如主题切换。具体实现如下：
1. **变量注入**：通过`createInjectPreflight`函数在运行时注入预定义的CSS变量。
2. **动态更新**：允许在运行时动态修改变量值，从而实现样式的实时更新。
3. **兼容性处理**：针对不同小程序平台的CSS变量支持情况，进行相应的兼容性处理。

这种模式提供了更高的灵活性，但可能会增加运行时的计算开销。

**Section sources**
- [options-a2565187.mjs](file://demo/gulp-app/weapp-tw-dist/options-a2565187.mjs)

## 作用域与继承行为
weapp-tailwindcss 支持CSS变量的作用域管理和继承行为。具体特点如下：
1. **作用域管理**：CSS变量可以在不同的作用域内定义和使用，避免全局污染。
2. **继承行为**：子元素会继承父元素的CSS变量，除非被显式覆盖。
3. **优先级处理**：通过合理的变量命名和作用域设计，确保变量的优先级和覆盖关系符合预期。

这些特性使得CSS变量在复杂的小程序项目中更加可控和可维护。

**Section sources**
- [cssVarsV3.ts](file://packages/postcss/src/cssVarsV3.ts)
- [cssVarsV4.ts](file://packages/postcss/src/cssVarsV4.ts)

## 主题切换应用
weapp-tailwindcss 支持通过CSS变量实现主题切换。具体步骤如下：
1. **定义主题变量**：在`cssVarsV3.ts`或`cssVarsV4.ts`中定义不同主题的变量集。
2. **动态注入**：通过`createInjectPreflight`函数在运行时注入对应主题的变量。
3. **用户交互**：提供用户界面，允许用户选择不同的主题，触发变量的动态更新。

这种方案不仅简化了主题切换的实现，还保证了样式的统一性和一致性。

**Section sources**
- [cssVarsV3.ts](file://packages/postcss/src/cssVarsV3.ts)
- [cssVarsV4.ts](file://packages/postcss/src/cssVarsV4.ts)
- [options-a2565187.mjs](file://demo/gulp-app/weapp-tw-dist/options-a2565187.mjs)

## 多平台兼容性解决方案
weapp-tailwindcss 针对不同小程序平台（微信、支付宝、字节等）提供了兼容性解决方案：
1. **平台检测**：通过`uni-platform.ts`等工具函数检测当前运行的小程序平台。
2. **条件编译**：根据平台特性进行条件编译，生成适合特定平台的CSS代码。
3. **回退机制**：对于不支持某些CSS特性的平台，提供回退方案，确保基本功能的可用性。

这些措施确保了weapp-tailwindcss在各种小程序平台上的稳定性和兼容性。

**Section sources**
- [uni-platform.ts](file://packages/weapp-tailwindcss/src/utils/uni-platform.ts)

## 总结
weapp-tailwindcss 通过编译时替换和运行时注入两种模式，全面支持CSS变量的处理。无论是静态样式优化还是动态主题切换，都能提供高效且灵活的解决方案。同时，通过细致的作用域管理和多平台兼容性处理，确保了在各种小程序环境中的稳定表现。