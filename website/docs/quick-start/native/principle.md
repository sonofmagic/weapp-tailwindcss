# 更多的细节

## CLI 配置项和类型定义

`CLI` 内部本身也集成了 `typescript` 和 `sass` / `less` 的编译，你可以通过配置项，开启它们进行编译，

也可以使用使用微信开发者工具中的 `setting#useCompilerPlugins` 字段，使用微信开发者工具内置插件进行编译

[详见BuildOptions](/docs/api-cli/interfaces/BuildOptions)

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
