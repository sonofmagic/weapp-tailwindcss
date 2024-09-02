# 更多场景

## CLI 配置项和类型定义

`CLI` 内部本身也集成了 `typescript` 和 `sass` / `less` 的编译，你可以通过配置项，开启它们进行编译，

也可以使用使用微信开发者工具中的 `setting#useCompilerPlugins` 字段，使用微信开发者工具内置插件进行编译

[详见BuildOptions](/docs/api-cli/interfaces/BuildOptions)

## 如何启用 rem 转 rpx(px)

在 `weapp-tw.config.js` 里添加:

```js title="weapp-tw.config.js"
/** @type {import('@weapp-tailwindcss/cli').UserConfig} */
const config = {
  // ...
  // highlight-start
  weappTailwindcssOptions: {
    rem2rpx: true,
  },
  // highlight-end
}

module.exports = config
```

## 如何启用更多的 postcss 插件

在 `postcss.config.js` 里面正常添加即可，但是要注意，假如你使用预处理器插件，比如 `sass` / `less` 等等的

你必须**不**使用 `微信开发者工具` 自带的编译插件, 即从 `project.config.json` > `setting` > `useCompilerPlugins` 数组字段中，把 `sass` / `less` 插件去掉

然后你需要启用 `@weapp-tailwindcss/cli` 自带的 `sass` 编译

首先先安装 `sass`, `npm i -D sass`

然后在 `weapp-tw.config.js` 添加字段:

```js
/** @type {import('@weapp-tailwindcss/cli').UserConfig} */
const config = {
  preprocessorOptions: {
    sass: true,
  },
}

module.exports = config
```

这样 `@weapp-tailwindcss/cli` 就会进行 `sass` 编译，即 `scss` -> `wxss`

这样才能进行 `postcss` 插件的处理，不然你使用某些 `postcss` 插件，比如 `postcss-pxtransform` 这种，就会报错。

原因在于 `postcss-pxtransform` 是无法处理 `sass` 的 `ast` 的。

## 如何兼容原生小程序的？

主要是依靠 `@weapp-tailwindcss/cli`

`@weapp-tailwindcss/cli`  是一个利用 `gulp` 构建最小化的一个微信小程序原生开发的工具链

## 为什么不是 `webpack`/`vite`

其实使用 `webpack` / `vite` 这些实现都是可以的，主要的区别仅仅在于是否够用，从第一阶段的目的来说 `gulp` 是够用的。

## 初始化修改你的配置

`@weapp-tailwindcss/cli` 会去修改你项目里的 `project.config.json` 配置

在你的 `project.config.json` 额外添加:

```json
{
  "setting": {
    "packNpmManually": true,
    "packNpmRelationList": [
      {
        "packageJsonPath": "./package.json",
        "miniprogramNpmDistDir": "./dist"
      }
    ]
  },
  "miniprogramRoot": "dist/"
}
```

这个配置主要做 `2` 件事:

1. 修改产物的导入目录，从 当前目录，变成 `dist/` (`miniprogramRoot`)
2. 修改 `npm` 包的构建位置，从当前目录的 `miniprogram_npm` 变成 `dist/miniprogram_npm` 目录

此时使用微信开发者工具构建的 `npm`，即可看到效果

## TypeScript 支持

:::info
在使用 原生 typescript 插件编译的注意事项:

使用微信开发者工具编译 `typescript` 的配置如下：

```json title="project.config.json"
{
  "setting": {
    "useCompilerPlugins":[
      "typescript"
    ]
  }
}
```

:::
