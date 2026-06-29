---
title: uni-app 条件编译样式
description: 在 uni-app 多端项目中使用 Tailwind CSS v4 的 @custom-variant，为原子类生成平台条件编译样式。
keywords:
  - 快速开始
  - uni-app
  - 条件编译
  - custom variant
  - ifdef
  - ifndef
  - weapp-tailwindcss
  - tailwindcss
  - 小程序
  - 微信小程序
---
# uni-app 条件编译样式

Tailwind CSS v4 可以直接用 `@custom-variant` 描述 uni-app 的条件编译分支，不再需要额外声明 `weapp-tailwindcss/css-macro`。它适合多端项目里少量平台差异样式，比如“微信小程序蓝色，H5 橙色”，或者“非微信小程序隐藏某个样式分支”。

## 能解决什么

uni-app 本身支持 CSS 条件编译：

```css
/* #ifdef MP-WEIXIN */
.button {
  background: #1677ff;
}
/* #endif */
```

写 Tailwind 原子类时，可以先在入口 CSS 中定义条件变体：

```css
@import "tailwindcss";

@custom-variant wx {
  /* #ifdef MP-WEIXIN */
  @slot;
  /* #endif */
}

@custom-variant not-wx {
  /* #ifndef MP-WEIXIN */
  @slot;
  /* #endif */
}
```

然后在模板里使用语义化前缀：

```html
<view class="wx:bg-blue-500 not-wx:bg-red-500">
  微信小程序为蓝色，其他平台为红色
</view>
```

也可以定义 H5 / 小程序组合条件：

```css
@custom-variant h5-or-wx {
  /* #ifdef H5 || MP-WEIXIN */
  @slot;
  /* #endif */
}

@custom-variant not-h5-or-wx {
  /* #ifndef H5 || MP-WEIXIN */
  @slot;
  /* #endif */
}
```

```html
<view class="h5-or-wx:bg-blue-400 not-h5-or-wx:bg-gray-400">
  H5 和微信小程序使用蓝色，其他平台使用灰色
</view>
```

## 当前生成链路

`@custom-variant` 由 Tailwind CSS v4 原生解析。`weapp-tailwindcss` 继续负责生成目标端 CSS、处理小程序选择器兼容与平台裁剪：

1. Tailwind CSS 根据 `@custom-variant` 生成带条件编译注释的工具类规则。
2. `weapp-tailwindcss` 在生成目标端 CSS 时保留条件注释结构。
3. 当构建链路能识别当前平台时，会在最终样式输出前裁剪不匹配分支；识别不到平台时，条件注释交给后续 uni-app 构建处理。

这意味着：

- 小程序目标构建会输出已经适配小程序选择器的样式，并移除不匹配的平台分支。
- H5 / Web 目标构建会保留 Web 选择器格式，并同样按平台裁剪。
- 不需要再配置 `@plugin "weapp-tailwindcss/css-macro"`。
- 不需要手动注册 `weapp-tailwindcss/css-macro/postcss`。

## 推荐写法

把平台差异集中在入口 CSS 中，模板里只使用业务可读的变体名：

```css
@import "tailwindcss";
@source "../src/**/*.{vue,js,ts,jsx,tsx,wxml,axml}";

@custom-variant wx {
  /* #ifdef MP-WEIXIN */
  @slot;
  /* #endif */
}

@custom-variant h5 {
  /* #ifdef H5 */
  @slot;
  /* #endif */
}

@custom-variant app {
  /* #ifdef APP-PLUS */
  @slot;
  /* #endif */
}
```

```html
<view class="wx:bg-green-500 h5:bg-orange-500 app:bg-sky-500">
  不同平台使用不同背景色
</view>
```

如果需要“非某平台”分支，单独声明反向变体：

```css
@custom-variant not-app {
  /* #ifndef APP-PLUS */
  @slot;
  /* #endif */
}
```

```html
<view class="app:hidden not-app:flex">
  App 隐藏，其他平台显示
</view>
```

## 平台表达式

条件注释中的平台表达式仍然使用 uni-app 官方语法：

```css
@custom-variant mp {
  /* #ifdef MP */
  @slot;
  /* #endif */
}

@custom-variant wx-or-alipay {
  /* #ifdef MP-WEIXIN || MP-ALIPAY */
  @slot;
  /* #endif */
}
```

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

当构建链路能拿到当前平台时，`weapp-tailwindcss` 会在最终样式输出前裁剪条件分支。平台来源包括 `cssOptions.platform` 和常见环境变量：

- `WEAPP_TW_TARGET`
- `WEAPP_TAILWINDCSS_TARGET`
- `UNI_PLATFORM`
- `UNI_UTS_PLATFORM`
- `TARO_ENV`
- `MPX_CLI_MODE`
- `MPX_CURRENT_TARGET_MODE`

例如当前平台为 `mp-weixin` 时：

```html
<view class="wx:bg-blue-500 not-wx:bg-red-500"></view>
```

最终只保留匹配微信小程序的 `bg-blue-500` 分支，不会把 `#ifndef MP-WEIXIN` 的样式残留到最终样式里。

## 旧 css-macro 写法迁移

旧项目里的写法可以按下面方式迁移：

```diff
 @import "tailwindcss";
-@plugin "weapp-tailwindcss/css-macro";

+@custom-variant wx {
+  /* #ifdef MP-WEIXIN */
+  @slot;
+  /* #endif */
+}
+
+@custom-variant not-wx {
+  /* #ifndef MP-WEIXIN */
+  @slot;
+  /* #endif */
+}
```

模板中把动态平台表达式改成稳定别名：

```diff
-<view class="ifdef-[MP-WEIXIN]:bg-blue-500 ifndef-[MP-WEIXIN]:bg-red-500"></view>
+<view class="wx:bg-blue-500 not-wx:bg-red-500"></view>
```

常规项目不要再手动添加 `weapp-tailwindcss/css-macro/postcss`：

```diff
// postcss.config.js / vite.config.ts
plugins: [
-  require('weapp-tailwindcss/css-macro/postcss'),
]
```

## 在 `@apply` 中使用

条件变体也可以放进 CSS 的 `@apply`：

```css
.apply-test {
  @apply wx:bg-blue-400 not-wx:bg-red-400;
}
```

和模板 class 一样，最终会按目标平台裁剪。

## IDE 智能提示

安装 VS Code / WebStorm 的 Tailwind CSS 官方插件后，在入口 CSS 中声明的 `@custom-variant` 名称可以参与补全。

如果刚改完配置没有提示，先重启编辑器的 Tailwind CSS Language Server。
