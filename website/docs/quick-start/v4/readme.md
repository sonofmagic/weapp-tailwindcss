---
title: 开发参考手册
description: Tailwind CSS 4 在 weapp-tailwindcss 中的配置说明。
keywords:
  - 快速开始
  - 安装
  - 配置
  - 开发参考手册
  - quick start
  - v4
  - weapp-tailwindcss
  - tailwindcss
  - 小程序
  - 微信小程序
  - uni-app
  - taro
  - mpx
---
# 开发参考手册

:::warning
由于 `tailwindcss@4.x` 本身还在快速的开发迭代中，即使是小版本也可能带有一些意外的 `Breaking Change`

所以以下内容可能会经常变更，如果发现已经过时，请提 `issue` 或者直接修复提 `pr`
:::

<!-- 旧版兼容说明已移除。

目前用户汇报了部分手机，可能是由于内部使用的 `webview` 版本太低，或者一些其他的因素，导致了样式不生效的问题，尤其是华为手机。

`tailwindcss@4.x` 生成的样式，对现代的浏览器来说刚刚好，可是对那些移动设备来说，就不一定了。 -->

当前文档仅维护 Tailwind CSS 4 接入说明。

## 定位的变化: 样式预处理器

`tailwindcss@4` 存在定位的重大变更

它直接变成了一个样式预处理器，和原生 `css` 已经它的规范相结合，相辅相成。

所以你在 `4.x` 版本中，不应该让 `tailwindcss` 和 `sass`,`less`,`stylus` 一起使用

详见: https://tailwindcss.com/docs/compatibility#sass-less-and-stylus

## 集成选择

`tailwindcss` 集成上提供了多种选择（`cli`、`vite`、`postcss`）。在 `weapp-tailwindcss@5` 的生成模式下，大部分小程序项目不再直接注册这些官方 Tailwind 构建插件，而是只注册 `weapp-tailwindcss` 自己的构建器插件：

1. Vite 项目注册 `weapp-tailwindcss/vite` 的 `WeappTailwindcss`。
2. Webpack 项目注册 `weapp-tailwindcss/webpack` 的 `WeappTailwindcss`。
3. Tailwind CSS 4 由 `WeappTailwindcss` 读取配置并生成目标 CSS。
4. `postcss.config.js` 里不再注册 `@tailwindcss/postcss` 或 `tailwindcss` PostCSS 插件。

这样可以避免同一个构建里同时存在两套 Tailwind 生成链路：官方 Tailwind 插件先生成一次浏览器 CSS，`weapp-tailwindcss` 再尝试二次后处理。生成模式会直接输出小程序目标 CSS，并让模板 / JS 类名转译共享同一份 `classSet`。

Mpx 也使用 `weapp-tailwindcss/webpack` 的 `WeappTailwindcss` 接管 CSS 生成、模板与 JS 转译。不要再为 Tailwind CSS 额外注册 PostCSS 生成插件。

## 小程序样式入口

在 v5 生成模式下，小程序 CSS 入口直接写 `@import "tailwindcss"`，`WeappTailwindcss` 会按默认 `target: 'weapp'` 生成小程序目标 CSS。存量项目里如果还看到 `@import "weapp-tailwindcss/index.css"`，建议迁移为 Tailwind 官方 CSS-first 入口写法。

### 为什么统一写 `@import "tailwindcss"`?

`tailwindcss@4` 的配置、主题变量和扫描范围都从 CSS 入口读取。统一使用 `@import "tailwindcss"` 可以让 Tailwind 官方 IntelliSense、`@source`、`@theme` 和 `WeappTailwindcss` 生成器读取同一份入口。小程序不支持或不适合直接保留的选择器、`@layer` 与浏览器 preflight，会在 `WeappTailwindcss` 输出小程序 CSS 时处理。

### 多端开发

假如你需要进行多端的开发，那么可以使用对应框架的样式条件编译写法，比如 `uni-app`:

多端项目建议让 H5 和小程序使用各自的构建入口：H5 仍使用 Tailwind 官方 Vite/PostCSS 插件，小程序入口只注册 `WeappTailwindcss`。两端可以共享同一个包含 `@import "tailwindcss"`、`@theme` 和 `@source` 的 CSS 文件，但不要在同一个小程序构建里同时注册两套 Tailwind 生成插件。

详见 https://uniapp.dcloud.net.cn/tutorial/platform.html

## css 作为配置文件

由于在 `tailwindcss@4` 中，配置文件默认为一个 `css` 文件，所以需要让 `weapp-tailwindcss` 能稳定找到你的入口 `css` 文件。

Tailwind CSS 4 项目推荐显式配置 `cssEntries`，让 `weapp-tailwindcss` 和 `tailwindcss` 保持一致的处理模式。多入口、分包、独立分包、Webpack、Gulp、自定义构建和多平台构建都应该写清楚这些入口。`cssEntries` 只负责入口识别，入口 CSS 仍然要被项目实际 import 或纳入构建图。

> `cssEntries` 为一个数组，就是你写 `@import "tailwindcss";` 的那些 CSS 入口文件，可以有多个。建议使用绝对路径。

```ts
{
  cssEntries: [
    // Tailwind CSS 入口文件
    // 比如 tarojs
    path.resolve(__dirname, '../src/app.css')
    // 比如 uni-app (没有 app.css 需要先创建，然后让 `main` 入口文件引入)
    // path.resolve(__dirname, './src/app.css')
  ],
}
```

如果漏掉 `cssEntries`，某些平台或构建器可能仍能自动识别入口，但这不是稳定契约；一旦构建图拆分、分包 CSS 独立输出或平台产物名变化，就可能出现 CSS 没生成、JS 字符串 class 已转译但缺少对应样式的情况。

:::warning 只注册到 CSS，不要注册到预处理样式文件
`tailwindcss@4` 的入口请只放在 `.css` 文件里，例如 `app.css`。

不要把 `@import "tailwindcss"` 或对应的 `cssEntries` 指向 `scss`、`less`、`sass` 这类预处理样式文件，否则很容易导致最终样式生成失败，或者 `weapp-tailwindcss` 转译失效。

推荐做法是：

1. 新建一个纯 `css` 入口文件，例如 `src/app.css`
2. 只在这个 `css` 文件里写 `@import "tailwindcss";`
3. 再让业务里的 `scss` / `less` 去间接引用这个 `css`，或者由主入口文件引入它
:::

> 插件会自动根据已安装的 Tailwind 版本开启 v4 模式。只有在调试自定义 `tailwindcss` 目录或多版本共存时，才需要在 `tailwindcss` 配置里手动指定 `version`。

## 使用 @apply

如果你想在 页面或者组件独立的 `CSS` 模块中使用 `@apply` 或 `@variant`，你需要使用 `@reference` 指令，来导入主题变量、自定义工具和自定义变体，以使这些值在该上下文中可用。

```css
/* 到你引入 tailwindcss 的 css 相对路径 */
@reference "../../app.css";
/* 如果你只使用默认主题，没有自定义，你可以直接 reference tailwindcss */
@reference "tailwindcss";
```

详见: https://tailwindcss.com/docs/functions-and-directives#reference-directive

## @layer 在小程序的降级方案

`tailwindcss@4` 使用原生的 `@layer` 去控制样式的优先级

> 如果你不知道什么是 `@layer`，你可以阅读这篇文档 https://developer.mozilla.org/zh-CN/docs/Web/CSS/@layer

但是像 `uni-app` / `taro` 这种框架，默认都是直接引入很多内置样式的。

于是就会出现下方尴尬的情况: 优先级 `(0,1,0)` 的 `class` 选择器样式无法覆盖 `(0,0,1)` 的标签选择器样式:

![](./tailwindcss-v4-uniapp-layer.png)

这种情况，你就非常需要兼容性降级方案，即使用 [`postcss-preset-env`](https://www.npmjs.com/package/postcss-preset-env)（`weapp-tailwindcss` 已经内置了这个插件，可通过 [`cssOptions.cssPresetEnv`](/docs/api/options/important#cssoptions) 配置）。

这在开发需要兼容低版本移动端 h5 的时候很重要。

## 使用 pnpm

默认使用 `pnpm` 的时候，由于 `pnpm` 是无法使用幽灵依赖的

但是 `uni-app`/`taro` 出于一些历史原因，是需要幽灵依赖的，这时候可以在项目下创建 `.npmrc` 添加内容如下

```txt title=".npmrc"
shamefully-hoist=true
```

然后重新执行 `pnpm i` 安装包即可运行

## 智能提示

目前 `tailwindcss@4` 的 VS Code `Tailwind CSS IntelliSense` 插件，会优先从它识别到的 Tailwind 入口里推导配置与候选类名。

在小程序项目里，现在推荐直接写 `@import "tailwindcss";`。这样既符合 Tailwind CSS 4 的 CSS-first 入口，也能让 `WeappTailwindcss` 在生成模式下输出小程序目标 CSS。

相关修复可以关注这个 PR：

- https://github.com/tailwindlabs/tailwindcss-intellisense/pull/1557

根据 `tailwindcss-intellisense` 当前实现，真正生效的做法是显式配置 `tailwindCSS.experimental.configFile`。对于 `tailwindcss@4`，这里传入的不是 `tailwind.config.js`，而是你的 **CSS 入口文件**。

如果项目只有一个入口，直接把它指向实际使用的那个 `app.css` 即可：

```json title=".vscode/settings.json"
{
  "tailwindCSS.experimental.configFile": "src/app.css"
}
```

这样配置后，扩展会直接把 `src/app.css` 当成 Tailwind 4 项目入口来加载，恢复补全、悬浮提示和诊断。

如果你的项目有多个 Tailwind 入口，则改用对象写法，把每个 CSS 入口映射到对应的文件范围：

```json title=".vscode/settings.json"
{
  "tailwindCSS.experimental.configFile": {
    "packages/a/src/app.css": "packages/a/src/**",
    "packages/b/src/app.css": "packages/b/src/**"
  }
}
```

如果你仍然想额外创建一个只给编辑器使用的 CSS 文件，也必须把这个文件写进 `tailwindCSS.experimental.configFile`，仅仅在 `App.vue` 里引入它并不会让 IntelliSense 绑定到该入口。

下面是一个编辑器专用入口的可选写法：

```css title="main.css"
@import "tailwindcss";
@source not "dist";
@source not "../src/uni_modules";
```

```json title=".vscode/settings.json"
{
  "tailwindCSS.experimental.configFile": "src/main.css"
}
```

这个 `main.css` 只用于 IntelliSense，不需要也不应该在实际应用入口里引入。业务真正生效的入口仍然是你的 `app.css` 里的 `@import "tailwindcss"`。

这里必须使用 `@import "tailwindcss"`，而不是 `@import "weapp-tailwindcss/index.css"` 或 `@import "weapp-tailwindcss/theme.css"`。原因是 `tailwindcss-intellisense` 当前源码里，真正决定是否按 v4 设计系统加载的是 `packages/tailwindcss-language-server/src/util/v4/design-system.ts` 里的 `isMaybeV4()`，它只检查：

- `@import "tailwindcss"`
- `@theme {}`

也就是说：

- `@import "weapp-tailwindcss/index.css"`：不会触发这段 v4 识别
- `@import "weapp-tailwindcss/theme.css"`：同样不会触发
- `@import "tailwindcss"`：可以稳定触发 v4 IntelliSense

如果你的项目不是 `dist` 目录，而是 `unpackage`、`build` 等其他输出目录，请把 `@source not "dist";` 改成自己的实际产物目录。

## `uni-app` / `uni-app x` 项目里的 `@source` 扫描范围排障

### 问题现象

当 `uni-app` 项目把第三方插件或依赖放在 `src/uni_modules` 下，或者 `HBuilderX` / `uni-app x` 项目把依赖放在根目录 `uni_modules` 下时，如果 Tailwind 4 的 CSS 入口没有显式排除这些目录，扫描阶段就可能把依赖源码中的正则片段、README 示例文本或构建产物误识别为候选。

最终表现通常不是业务代码真的写了这些类名，而是产物里平白多出很多无意义样式，增加排查成本。

### 根因

根因是扫描范围过宽，把第三方源码、README 示例文本或构建产物误当成候选。

### 推荐配置

命令行 `uni-app` 项目推荐：

```css
@source not "../src/uni_modules";
```

`HBuilderX` / `uni-app x` 项目推荐：

```css
@source not "uni_modules";
```

同时保留对实际构建产物目录的排除，例如：

```css
@source not "dist";
```

或：

```css
@source not "unpackage";
```

### 最佳实践

- `@source` 应尽量只覆盖业务源码目录
- 默认排除 `uni_modules`、`node_modules`、`dist`、`unpackage`、文档和生成产物
- 如果必须扫描某个 `uni_modules` 包，应只精确包含真正承载模板类名的文件，而不是全量扫描整个目录

> **注意**：从 `tailwindcss-intellisense` 的源码来看，`experimental.configFile` 在 v4 下支持 `string` 和 `object` 两种形式，路径会相对于工作区或 `.code-workspace` 文件解析。关键是“显式声明 CSS 入口”，并且这个入口本身要满足它的 v4 识别条件。

## 如何去除 preflight 样式

使用 `@import "tailwindcss"` 时，`WeappTailwindcss` 会按当前 Tailwind 主版本注入小程序可用的基础 reset。

### 什么是 preflight 样式

一些全局的 `reset` 样式，用来让一些标签行为统一的，比如你在你的样式中，看到的:

```css
view,text,::before,::after,::backdrop {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0 solid;
}
```

类似这样的就是 `weapp-tailwindcss` 给你的应用注入的 `preflight` 样式

### 解决方案

如果你确认不需要这段基础 reset，可以在 `WeappTailwindcss` 里关闭：

```ts
WeappTailwindcss({
  cssOptions: {
    cssPreflight: false,
  },
})
```

如果只是要覆盖其中一部分声明，可以传入对象覆盖默认值，例如：

```ts
WeappTailwindcss({
  cssOptions: {
    cssPreflight: {
      margin: '0',
      padding: '0',
    },
  },
})
```

## 使用大写单位 (h-[100PX]) 无效问题

默认情况下，在 `process.env.NODE_ENV === 'production'` 的时候，Tailwind CSS v4 会自动进入优化模式。

它会进行 `CSS` 单位的校准，比如把大写的 `PX` 转化为小写的 `px`。v5 生成模式下不要通过 `@tailwindcss/postcss` 配置这个行为；如果确实需要保留大写单位，请先评估是否可以改成小程序推荐的 `rpx` / `px` 写法，或在 `WeappTailwindcss` 的生成模式配置中显式校验产物。

```js
WeappTailwindcss({
})
```
