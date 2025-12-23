# calc函数支持

<cite>
**本文档引用的文件**   
- [getCalcPlugin.ts](file://packages/postcss/src/plugins/getCalcPlugin.ts)
- [typedoc.export.ts](file://packages/weapp-tailwindcss/src/typedoc.export.ts)
- [config.ts](file://packages/weapp-tailwindcss/src/tailwindcss/v4/config.ts)
- [types.ts](file://packages/postcss/src/types.ts)
- [dataTypes.js](file://packages/weapp-tailwindcss/test/fixtures/tailwindcss/dataTypes.js)
- [v4.3-release.md](file://website/blog/2025/9/v4.3-release.md)
</cite>

## 目录
1. [简介](#简介)
2. [calc函数基础支持](#calc函数基础支持)
3. [单位转换与精度控制](#单位转换与精度控制)
4. [与其他CSS函数的组合使用](#与其他css函数的组合使用)
5. [构建工具配置](#构建工具配置)
6. [已知限制与注意事项](#已知限制与注意事项)

## 简介
weapp-tailwindcss 提供了对 `calc()` 数学表达式的全面支持，特别针对小程序环境中的兼容性问题进行了优化。该工具通过预计算 CSS 变量和 `calc` 表达式，解决了不同手机机型对 `calc` 计算不一致的问题。默认情况下，在 `tailwindcss@4` 中启用了 CSS 变量计算模式，而在 `tailwindcss@3` 中则默认不启用。

**Section sources**
- [v4.3-release.md](file://website/blog/2025/9/v4.3-release.md#L1-L10)

## calc函数基础支持
weapp-tailwindcss 通过 `cssCalc` 配置项来控制 `calc` 表达式的处理。此配置项可以接受布尔值、选项对象或自定义匹配列表（支持正则表达式）。当启用 `cssCalc` 时，插件会预编译所有的 CSS 变量和 `calc` 计算表达式，从而提高多端 `rpx` 与 `calc` 的兼容性。

例如，原始的 CSS 输出如下：
```css
page,
:root {
  --spacing: 8rpx;
}
.h-2 {
  height: calc(var(--spacing) * 2);
}
```

启用 `cssCalc` 后，结果变为：
```css
page,
:root {
  --spacing: 8rpx;
}
.h-2 {
  height: 16rpx;
  height: calc(var(--spacing) * 2);
}
```

可以通过将 `cssCalc` 配置项设为 `false` 来手动关闭此功能。

**Section sources**
- [typedoc.export.ts](file://packages/weapp-tailwindcss/src/typedoc.export.ts#L134-L164)
- [v4.3-release.md](file://website/blog/2025/9/v4.3-release.md#L15-L45)

## 单位转换与精度控制
weapp-tailwindcss 支持将 `px` 单位转换为 `rpx` 单位，并且可以通过 `px2rpx` 配置项进行控制。默认情况下，`px2rpx` 为 `false`，即不进行转换。如果需要将所有 `px` 单位以 1:1 的比例转换为 `rpx` 单位，可以将 `px2rpx` 设为 `true`。

此外，还可以通过传递一个对象来自定义转换方式，具体配置项可参考 [postcss-pxtransform](https://www.npmjs.com/package/postcss-pxtransform)。

**Section sources**
- [types.ts](file://packages/postcss/src/types.ts#L6-L7)
- [v4.3-release.md](file://website/blog/2025/9/v4.3-release.md#L15841-L15845)

## 与其他CSS函数的组合使用
weapp-tailwindcss 支持 `calc` 函数与 `min`、`max` 和 `clamp` 等其他 CSS 函数的组合使用。这些函数可以在 `calc` 表达式中嵌套使用，以实现更复杂的布局需求。例如：

```css
width: clamp(100px, calc(50% - 20px), 300px);
```

这种组合使用方式允许开发者在不同的屏幕尺寸下灵活调整元素的大小。

**Section sources**
- [dataTypes.js](file://packages/weapp-tailwindcss/test/fixtures/tailwindcss/dataTypes.js#L57-L61)

## 构建工具配置
weapp-tailwindcss 支持多种构建工具，包括 Webpack 和 Vite。对于 Vite 用户，可以通过 `vite.config.ts` 文件中的 `uvwt` 插件来配置 `cssCalc` 选项。例如：

```ts
import { uvwt } from 'weapp-tailwindcss/vite';

export default {
  plugins: [
    uvwt({
      cssCalc: true,
    }),
  ],
};
```

对于 Webpack 用户，可以在 `webpack.config.js` 中通过类似的配置来启用 `cssCalc` 功能。

**Section sources**
- [getCalcPlugin.ts](file://packages/postcss/src/plugins/getCalcPlugin.ts#L7-L19)
- [vite.test.ts](file://packages/weapp-tailwindcss/test/vitest/vite.test.ts#L97-L185)

## 已知限制与注意事项
尽管 weapp-tailwindcss 提供了强大的 `calc` 函数支持，但仍有一些已知的限制和注意事项：

1. **兼容性问题**：某些旧版本的小程序可能不完全支持 `calc` 函数的所有特性，建议在目标平台上进行充分测试。
2. **性能影响**：预编译 `calc` 表达式可能会增加构建时间，特别是在大型项目中。
3. **配置复杂性**：虽然 `cssCalc` 提供了多种配置选项，但正确配置可能需要一定的学习成本。

为了确保最佳的兼容性和性能，建议根据项目的具体需求仔细调整 `cssCalc` 和相关配置项。

**Section sources**
- [typedoc.export.ts](file://packages/weapp-tailwindcss/src/typedoc.export.ts#L134-L164)
- [v4.3-release.md](file://website/blog/2025/9/v4.3-release.md#L46-L48)