# 原理

利用 `gulp` 构建最小化的一个微信小程序原生开发的工具链

## 为什么不是XXX

其实使用 `webpack` / `vite` 这些都是可以的

## 修改 `project.config.json`

额外添加:

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
