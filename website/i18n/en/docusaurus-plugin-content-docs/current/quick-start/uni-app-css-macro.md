---
title: uni-app conditional compilation style
description: Use @custom-variant of Tailwind CSS v4 in uni-app multi-end project to generate platform conditional compilation styles for atomic classes.
keywords:
  - quick start
  - uni-app
  - conditional compilation
  - custom variant
  - ifdef
  - ifndef
  - weapp-tailwindcss
  - tailwindcss
  - Mini program
  - WeChat applet
---

# uni-app conditional compilation style

Tailwind CSS v4 can directly use `@custom-variant` to describe the conditional compilation branch of uni-app, and no additional declaration of `weapp-tailwindcss/css-macro` is needed. It is suitable for a small number of platform-different styles in multi-terminal projects, such as "blue for WeChat applet, orange for H5", or "hide a certain style branch for non-WeChat applet".

## What can be solved?

uni-app itself supports CSS conditional compilation:

```css
/* #ifdef MP-WEIXIN */
.button {
  background: #1677ff;
}
/* #endif */
```

When writing a Tailwind atomic class, you can first define conditional variants in the entry CSS:

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

Then use semantic prefixes in the template:

```html
<view class="wx:bg-blue-500 not-wx:bg-red-500">
WeChat mini programs are blue and other platforms are red
</view>
```

You can also define H5 / applet combination conditions:

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
H5 and WeChat mini programs use blue, other platforms use gray
</view>
```

## Current generated link

`@custom-variant` is parsed natively by Tailwind CSS v4. `weapp-tailwindcss` continues to be responsible for generating target-side CSS, handling applet selector compatibility and platform tailoring:

1. Tailwind CSS generates tool class rules with conditional compilation comments based on `@custom-variant`.
2. `weapp-tailwindcss` preserves conditional comment structures when generating target-side CSS.
3. When the build link can identify the current platform, unmatched branches will be trimmed before the final style output; when the platform cannot be identified, the conditional annotation will be handed over to subsequent uni-app build processing.

This means:

- The mini program target build will output styles that have been adapted to the mini program selector and remove unmatched platform branches.
- H5/Web target builds retain web selector formatting and are similarly tailored to the platform.
- No need to configure `@plugin "weapp-tailwindcss/css-macro"` anymore.
- No need to manually register `weapp-tailwindcss/css-macro/postcss`.

## Recommended writing method

Concentrate platform differences in the entry CSS, and only use business-readable variant names in templates:

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
Use different background colors for different platforms
</view>
```

If you need a "non-platform" branch, declare the reverse variant separately:

```css
@custom-variant not-app {
  /* #ifndef APP-PLUS */
  @slot;
  /* #endif */
}
```

```html
<view class="app:hidden not-app:flex">
App is hidden and displayed on other platforms
</view>
```

## Platform expression

Platform expressions in conditional comments still use the uni-app official syntax:

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

Common platform values include:

- `H5` / `WEB`
- `MP-WEIXIN`
- `MP-ALIPAY`
- `MP-TOUTIAO`
- `MP-QQ`
- `MP`
- `APP` / `APP-PLUS`
- `QUICKAPP-WEBVIEW`

The complete platform value is subject to the official conditional compilation document of uni-app.

## Platform clipping behavior

When the built link can get the current platform, `weapp-tailwindcss` will prune the conditional branch before the final style output. Platform sources include `cssOptions.platform` and common environment variables:

- `WEAPP_TW_TARGET`
- `WEAPP_TAILWINDCSS_TARGET`
- `UNI_PLATFORM`
- `UNI_UTS_PLATFORM`
- `TARO_ENV`
- `MPX_CLI_MODE`
- `MPX_CURRENT_TARGET_MODE`

For example, when the current platform is `mp-weixin`:

```html
<view class="wx:bg-blue-500 not-wx:bg-red-500"></view>
```

In the end, only the `bg-blue-500` branch that matches the WeChat applet will be retained, and the style of `#ifndef MP-WEIXIN` will not be retained in the final style.

## Old css-macro writing method migration

The writing methods in the old project can be migrated as follows:

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

Change the dynamic platform expression into a stable alias in the template:

```diff
-<view class="ifdef-[MP-WEIXIN]:bg-blue-500 ifndef-[MP-WEIXIN]:bg-red-500"></view>
+<view class="wx:bg-blue-500 not-wx:bg-red-500"></view>
```

Do not add `weapp-tailwindcss/css-macro/postcss` manually to regular projects:

```diff
// postcss.config.js / vite.config.ts
plugins: [
-  require('weapp-tailwindcss/css-macro/postcss'),
]
```

## used in `@apply`

Conditional variants can also be put into CSS `@apply`:

```css
.apply-test {
  @apply wx:bg-blue-400 not-wx:bg-red-400;
}
```

Like the template class, it will eventually be tailored to the target platform.

## IDE smart prompts

After installing the Tailwind CSS official plug-in for VS Code/WebStorm, the `@custom-variant` name declared in the entry CSS can participate in completion.

If there is no prompt after just changing the configuration, restart the editor's Tailwind CSS Language Server first.
