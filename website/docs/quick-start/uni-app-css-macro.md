---
title: uni-app 条件编译 CSS 宏
description: 在 uni-app 多端项目中使用 weapp-tailwindcss/css-macro，为 Tailwind CSS 原子类生成平台条件编译样式，并在构建阶段按目标平台裁剪分支。
keywords:
  - 快速开始
  - uni-app
  - 条件编译
  - CSS 宏
  - css macro
  - ifdef
  - ifndef
  - weapp-tailwindcss
  - tailwindcss
  - 小程序
  - 微信小程序
---
# uni-app 条件编译 CSS 宏

`weapp-tailwindcss/css-macro` 用来把 Tailwind CSS 变体写成 uni-app 条件编译样式。它适合多端项目里少量平台差异样式，比如“微信小程序蓝色，H5 橙色”，或者“非微信小程序隐藏某个样式分支”。

从当前版本开始，常规 Vite / Webpack / Gulp 集成只需要在 Tailwind 侧声明 `weapp-tailwindcss/css-macro`。`weapp-tailwindcss` 会自动感应这个声明，内置执行宏转换，并在最终样式输出前按当前平台裁剪 `ifdef` / `ifndef` 分支。

## 能解决什么

uni-app 本身支持 CSS 条件编译：

```css
/* #ifdef MP-WEIXIN */
.button {
  background: #1677ff;
}
/* #endif */
```

写 Tailwind 原子类时，可以改成：

```html
<view class="ifdef-[MP-WEIXIN]:bg-blue-500 ifndef-[MP-WEIXIN]:bg-red-500">
  微信小程序为蓝色，其他平台为红色
</view>
```

也可以写 H5 / 小程序组合条件：

```html
<view class="ifdef-[H5||MP-WEIXIN]:bg-blue-400 ifndef-[H5||MP-WEIXIN]:bg-gray-400">
  H5 和微信小程序使用蓝色，其他平台使用灰色
</view>
```

或者用自定义别名减少重复：

```html
<view class="wx:bg-blue-400 -wx:bg-red-400">
  微信小程序为蓝色，非微信小程序为红色
</view>
```

## 当前生成链路

`css-macro` 现在分两步工作：

1. Tailwind CSS 插件把 `ifdef-[...]` / `ifndef-[...]` 或自定义变体生成内部条件节点，例如 `@weapp-tw-ifdef`。
2. `weapp-tailwindcss` 感应到宏插件后，自动追加内置 PostCSS 转换，把内部节点转成条件注释，并在已知目标平台时提前裁剪不匹配分支。

这意味着：

- 小程序目标构建会输出已经适配小程序选择器的样式，并移除不匹配的平台分支。
- H5 / Web 目标构建会保留 Web 选择器格式，并同样按平台裁剪。
- 常规集成不需要手动注册 `weapp-tailwindcss/css-macro/postcss`。
- 旧版伪 `@media (weapp-tw-platform:...)` 输出仍由 PostCSS 入口兼容处理，方便存量自定义流程迁移。

## Tailwind CSS 3 旧项目

当前文档站不再维护 Tailwind CSS 3 的 css-macro 接入内容。如果项目必须继续使用 `tailwindcss@3`，请安装 `weapp-tailwindcss@4` 并查看 [v4 文档站](https://v4.tw.icebreaker.top/)。

## Tailwind CSS v4

在入口 CSS 中声明插件：

```css
@import "tailwindcss";
@plugin "weapp-tailwindcss/css-macro";
```

之后可以在模板中使用同样的写法：

```html
<view class="ifdef-[H5]:bg-[#ff6611] ifndef-[MP-WEIXIN]:text-[#aa3300]">
  H5 条件样式
</view>
```

v4 场景下，`weapp-tailwindcss` 会扫描入口 CSS 中的 `@plugin "weapp-tailwindcss/css-macro"`，并自动启用宏转换。

## 自定义平台别名

如果默认的 `ifdef-[...]` / `ifndef-[...]` 太长，可以通过 `@plugin` 的 `variantsMap` 定义静态别名：

```css
@import "tailwindcss";
@plugin "weapp-tailwindcss/css-macro" {
  variantsMap: {
    wx: "MP-WEIXIN";
    mv: "H5 || MP-WEIXIN";
  }
}
```

对应用法：

```html
<view class="wx:bg-blue-400 ifndef-[MP-WEIXIN]:bg-red-400">
  微信小程序蓝色，非微信小程序红色
</view>
<view class="mv:text-blue-400 ifndef-[H5||MP-WEIXIN]:text-gray-500">
  H5 或微信小程序蓝色，其它平台灰色
</view>
```

配置项说明：

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `dynamic` | `boolean` | `true` | 是否注册 `ifdef-[...]` / `ifndef-[...]` 动态变体 |
| `variantsMap` | `Record<string, string>` | `{}` | 注册静态平台别名 |

## 平台表达式

动态变体里的平台条件会被写入 uni-app 条件编译注释：

```html
<view class="ifdef-[H5||MP-WEIXIN]:bg-blue-400"></view>
<view class="ifdef-[H5_||_MP-WEIXIN]:bg-blue-400"></view>
<view class="ifndef-[MP-WEIXIN]:bg-red-500"></view>
```

未转义的 `_` 会被规范化为空格，因此 `ifdef-[H5_||_MP-WEIXIN]` 等价于 `ifdef-[H5||MP-WEIXIN]`。如果你的表达式里确实需要保留字面量下划线，可以用反斜杠转义。

常见平台值包括：

- `H5` / `WEB`
- `MP-WEIXIN`
- `MP-ALIPAY`
- `MP-TOUTIAO`
- `MP-QQ`
- `MP`
- `APP` / `APP-PLUS`
- `QUICKAPP-WEBVIEW`

完整平台值以 uni-app 官方条件编译文档为准。

## 平台裁剪行为

当构建链路能拿到当前平台时，`weapp-tailwindcss` 会在最终样式输出前裁剪条件分支。平台来源包括 `styleOptions.platform` 和常见环境变量：

- `WEAPP_TW_TARGET`
- `WEAPP_TAILWINDCSS_TARGET`
- `UNI_PLATFORM`
- `UNI_UTS_PLATFORM`
- `TARO_ENV`
- `MPX_CLI_MODE`
- `MPX_CURRENT_TARGET_MODE`

例如 `platform: 'mp-weixin'` 时：

```html
<view class="ifdef-[MP-WEIXIN]:bg-blue-500 ifndef-[MP-WEIXIN]:bg-red-500"></view>
```

最终只保留匹配微信小程序的 `bg-blue-500` 分支，不会把 `#ifdef MP-WEIXIN` 或 `#ifndef MP-WEIXIN` 注释残留到最终样式里。

如果当前平台未知，宏仍会转换成 uni-app 条件编译注释，由后续 uni-app 构建处理。

## 不再需要手动 PostCSS 配置

常规项目不要再手动添加 `weapp-tailwindcss/css-macro/postcss`：

```diff
// postcss.config.js / vite.config.ts
plugins: [
-  require('weapp-tailwindcss/css-macro/postcss'),
]
```

保留 Tailwind 侧声明即可：

```css
/* Tailwind CSS v4 */
@plugin "weapp-tailwindcss/css-macro";
```

`weapp-tailwindcss/css-macro/postcss` 仍然是稳定导出入口，只建议用于自定义 PostCSS 流程或迁移旧的 `@media (weapp-tw-platform:...)` 宏输出。

## 在 `@apply` 中使用

宏变体也可以放进 CSS 的 `@apply`：

```css
.apply-test {
  @apply ifdef-[H5||MP-WEIXIN]:bg-blue-400 ifndef-[H5||MP-WEIXIN]:bg-red-400;
}

.apply-alias {
  @apply wx:text-blue-400 -wx:text-red-400;
}
```

和模板 class 一样，最终会按目标平台裁剪。

## IDE 智能提示

安装 VS Code / WebStorm 的 Tailwind CSS 官方插件后，动态变体和你在 `variantsMap` 中配置的静态别名都可以参与补全。

如果刚改完配置没有提示，先重启编辑器的 Tailwind CSS Language Server。下面是历史示例截图：

### 动态提示：`ifdef-[]` 和 `ifndef-[]`

![macro-tip0](./img/macro-tip0.png)

### 静态提示：`wx` 和 `-wx`

![macro-tip1](./img/macro-tip1.png)
