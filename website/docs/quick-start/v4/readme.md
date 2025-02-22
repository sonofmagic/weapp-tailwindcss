# 开发前注意(必须阅读！)

:::warning
由于 `tailwindcss@4.x` 本身还在快速的开发迭代中，以下内容可能会经常变更，如果发现已经过时，请提 `issue` 或者直接修复提 `pr`
:::

## 定位: 样式预处理器

相对于 `tailwindcss@3` 版本， `tailwindcss@4` 存在定位的重大变更

它直接变成了一个样式预处理器，和原生 `css` 已经它的规范相结合，相辅相成。

所以你在 `4.x` 版本中，不应该让 `tailwindcss` 和 `sass`,`less`,`stylus` 一起使用

详见: https://tailwindcss.com/docs/compatibility#sass-less-and-stylus

## 应该选择 `@tailwindcss/vite` 还是 `@tailwindcss/postcss` ?

### 从兼容性角度出发

`@tailwindcss/postcss` 兼容性更好，开发打包器使用 `vite` 和 `webpack` 的都能用

而 `@tailwindcss/vite` 这里只有 `vite` 能用。

### 从编译速度出发

应该是 `@tailwindcss/vite` 更快一些

### 本教程的原则

本教程的原则是，能用 `@tailwindcss/vite` 的尽量使用，否则就使用 `@tailwindcss/postcss`

当然，你也完全可以使用 `uni-app vite vue3` + `@tailwindcss/postcss` 这种组合的。

## 开发 h5

`tailwindcss@4` 使用原生的 `@layer` 去控制样式的优先级

> 如果你不知道什么是 `@layer`，你可以阅读这篇文档 https://developer.mozilla.org/zh-CN/docs/Web/CSS/@layer

但是像 `uni-app` / `taro` 这种框架，默认都是直接引入很多内置样式的。

于是就会出现下方尴尬的情况: 优先级 `(0,1,0)` 的 `class` 选择器样式无法覆盖 `(0,0,1)` 的标签选择器样式:

![](./tailwindcss-v4-uniapp-layer.png)

这种情况，你就非常需要兼容性降级方案，即使用 [`postcss-preset-env`](https://www.npmjs.com/package/postcss-preset-env)

