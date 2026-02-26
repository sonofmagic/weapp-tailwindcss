---
title: "\U0001F4A8跨多端开发CSS兼容"
description: 本插件主要作用于小程序环境，让开发者可以在小程序环境下可以使用 tailwindcss 的特性
keywords:
  - 跨多端开发CSS兼容
  - multi platform
  - weapp-tailwindcss
  - tailwindcss
  - 小程序
  - 微信小程序
  - uni-app
  - taro
  - rax
  - mpx
---
# 💨跨多端开发CSS兼容

## 何时开启插件

本插件主要作用于小程序环境，让开发者可以在小程序环境下可以使用 `tailwindcss` 的特性

然而在 `h5` 和 `app` 中，它们本来就是 `tailwindcss` 支持的环境，所以是没有必要开启本插件的。

所以你可以这样传入 `disabled` 选项。

### uni-app 示例

比如 `uni-app`:

```js title="vite.config.[jt]s"
const isH5 = process.env.UNI_PLATFORM === "h5";
// uni-app v2
// const isApp = process.env.UNI_PLATFORM === "app-plus";
// uni-app v3
const isApp = process.env.UNI_PLATFORM === "app";
// 只在小程序平台开启 weapp-tailwindcss 插件
// highlight-next-line
const WeappTailwindcssDisabled = isH5 || isApp;

const vitePlugins = [
  uni(),
  uvwt({
    // highlight-next-line
    disabled: WeappTailwindcssDisabled
  })
];
```

### Taro 示例

```js title="config/index.ts"
const isH5 = process.env.TARO_ENV === "h5";
const isApp = process.env.TARO_ENV === "rn";
// highlight-next-line
const WeappTailwindcssDisabled = isH5 || isApp;

webpackChain(chain) {
  chain.merge({
    plugin: {
      install: {
        plugin: UnifiedWebpackPluginV5,
        args: [
          {
            // highlight-next-line
            disabled: WeappTailwindcssDisabled,
            rem2rpx: true
          }
        ]
      }
    }
  });
},
```

其他的框架，请自行在对应的文档中，发掘不同目标平台的环境变量判断方式。

## uni-app 打包到 h5 svg icon 偏移问题

这是由于 `tailwindcss` 默认会把 `svg` 的 `display` 设置成 `block` 导致的，所以解决方案很简单

在你的全局样式，引入 `tailwindcss` 的地方下面加一行，进行样式覆盖:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
/*  #ifdef  H5  */
svg {
  display: initial;
}
/*  #endif  */
```

## uni-app 打包安卓 `rgb()` 颜色失效问题

这是由于 `uni-app` 打包成安卓中 `webview` 内核版本较低，无法兼容 `rgb(245 247 255 / var(--tw-bg-opacity))` 这样的 `css` 写法导致的

这时候我们需要把这个写法，转换为兼容写法: `rgba(245, 247, 255, var(--tw-bg-opacity))`，具体解决方案:

### 安装 `postcss-preset-env`

```bash npm2yarn
npm i -D postcss-preset-env
```

### 设置 `postcss.config.js`

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-preset-env': {
      browsers: 'chrome >= 50', // configure a compatible browser version
    },
  },
};
```

这样，所有的 `rgb` 和 `/` 写法就被转化成兼容写法了。

相关issue详见:<https://github.com/tailwindlabs/tailwindcss/issues/7618#issuecomment-1140693288>

## CSS变量计算模式

在 `tailwindcss@4` 下，默认启用 CSS 变量计算模式。`tailwindcss@3` 默认不启用。

此模式下会去预编译所有的 `css` 变量和 `calc` 计算表达式。

比如 `tailwindcss@4` 下原先生成的样式为:

```css
page,
:root {
  --spacing: 8rpx;
}
.h-2 {
  height: calc(var(--spacing) * 2);
}
```

在CSS变量计算模式启动，进行预编译之后，现在的结果为:

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

这个模式可以解决很多手机机型 `calc` `rpx` 单位的兼容问题。\
当处于 Tailwind CSS 模式（`tailwindcss@4` 及以上）时，插件会默认把 `--spacing` 注入到 `includeCustomProperties`，因此常见的 `space-x`/`space-y` 等工具类会被稳定计算。

> 可通过给插件，传入 `cssCalc` 配置项 `false` 来手动关闭这个功能

假如这时候你需要去除 CSS 变量的声明，你可以传入

```js
{
  cssCalc: ['--spacing']
}
// 或者更精确的
{
  cssCalc: {
    includeCustomProperties: ['--spacing']
  }
}
```

> 你也可以传入正则表达式

这样生成的结果就是:

```css
page,
:root {
  --spacing: 8rpx;
}
.h-2 {
  height: 16rpx;
}
```

通过这种方式可以解决手机机型 `calc` `rpx` 单位的兼容问题

详见: https://tw.icebreaker.top/docs/api/interfaces/UserDefinedOptions#csscalc

### `includeCustomProperties` 进阶用法

`cssCalc` 提供多种写法来控制需要参与计算的自定义属性。下面结合「执行前 / 执行后」的示例说明差异。

**数组写法**

```ts
cssCalc: ['--spacing', '--gap']
```

- 执行前：

  ```css
  :root {
    --gap: 6rpx;
    --spacing: 8rpx;
  }
  .space-x-2>view+view {
    margin-left: calc(var(--gap) * (1 - var(--tw-space-x-reverse)));
    margin-right: calc(var(--spacing) * var(--tw-space-x-reverse));
  }
  ```

- 执行后：

  ```css
  .space-x-2>view+view {
    margin-left: 6rpx;
    margin-right: 8rpx;
  }
  ```

**对象写法**

```ts
cssCalc: {
  includeCustomProperties: ['--gap'],
  precision: 6,
  preserve: true,
}
```

- 执行前：

  ```css
  :root {
    --gap: 12rpx;
  }
  .btn {
    margin-bottom: calc(var(--gap) * 2);
  }
  ```

- 执行后：

  ```css
  :root {
    --gap: 12rpx;
  }
  .btn {
    margin-bottom: 24rpx;
    margin-bottom: calc(var(--gap) * 2);
  }
  ```

**正则写法**

```ts
cssCalc: [/^--(gap|spacing)$/]
```

- 执行前：

  ```css
  :root {
    --gap: 4rpx;
    --spacing: 10rpx;
  }
  .card + .card {
    margin-top: calc(var(--spacing) * 2);
    margin-left: calc(var(--gap) * 3);
  }
  ```

- 执行后：

  ```css
  .card + .card {
    margin-top: 20rpx;
    margin-top: calc(var(--spacing) * 2);
    margin-left: 12rpx;
    margin-left: calc(var(--gap) * 3);
  }
  ```

**Tailwind 统一变量写法**

```ts
cssCalc: {
  includeCustomProperties: [/^--tw-/],
  preserve: true,
}
```

- 执行前：

  ```css
  :root {
    --tw-space-y-reverse: 0;
    --tw-gradient-from: #38bdf8;
    --tw-gradient-stops: var(--tw-gradient-from), rgba(56,189,248,0);
  }
  .space-y-3>view+view {
    margin-top: calc(var(--spacing) * 3 * (1 - var(--tw-space-y-reverse)));
  }
  .from-sky-400 {
    background-image: linear-gradient(to right, var(--tw-gradient-stops));
  }
  ```

- 执行后：

  ```css
  :root {
    --tw-space-y-reverse: 0;
    --tw-gradient-from: #38bdf8;
    --tw-gradient-stops: var(--tw-gradient-from), rgba(56,189,248,0);
  }
  .space-y-3>view+view {
    margin-top: 24rpx;
    margin-top: calc(var(--spacing) * 3 * (1 - var(--tw-space-y-reverse)));
  }
  .from-sky-400 {
    background-image: linear-gradient(to right, var(--tw-gradient-stops));
  }
  ```

以上示例可以自由组合使用，帮助你根据业务场景精确控制 `calc` 与自定义属性的计算范围。
