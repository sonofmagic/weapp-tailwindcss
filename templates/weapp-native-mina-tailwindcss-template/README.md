# weapp-tailwindcss 原生小程序模板

假如你觉得好用，欢迎给我的 [`weapp-tailwindcss`](https://github.com/sonofmagic/weapp-tailwindcss) 点个 `Star` 吧。

## 官方文档

<https://weapp-tw.icebreaker.top/>

## 修改 ts 代码后热更新不生效？

记得关闭微信开发者工具中，`启动代码自动热重载功能` 这个功能。

## 组件样式隔离

由于目前，原生微信小程序组件样式隔离，默认为启用。而 `tailwindcss` 自动生成的原子类样式是在 `app.wxss` 里的。

所以组件内想要应用上 `tailwindcss` 的样式，需要在组件内对应的 `.json` 文件添加:

```json
{
  "styleIsolation": "apply-shared"
}
```

详见 [组件样式隔离](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/wxml-wxss.html)

## Cli快速启动

本项目已经集成 `weapp-ide-cli` 可以通过 `cli` 对 `ide` 进行额外操作，[详细信息](https://www.npmjs.com/package/weapp-ide-cli)

## 安装第三方 UI 库

`yarn add tdesign-miniprogram`

然后在 `plugin` -> `MinaWebpackPlugin.js` 里的 `inflateEntries` 方法里，发现 `tdesign-miniprogram` 时，直接 `return`

`yarn start`

安装完之后，需要在微信开发者工具中对 `npm` 进行构建：`工具 - 构建 npm`

另外，像 `tdesign-miniprogram` 它是允许传入外部样式类的，此时可以对 `UnifiedWebpackPluginV5` 插件的 `customAttributes` 进行配置，这样 `t-class` 这种才能准确转义。详见 `webpack.config.js`

## 此项目和 [`listenzz/MyMina`](https://github.com/listenzz/MyMina) 的不同点

- 摒弃了 `node-sass`，改用了 `dart-sass`
- 摒弃了 `moment`，改用了 `dayjs`
- 添加了 `postcss8` 和 `tailwindcss` 支持

## 打包原理见原版 [listenzz/MyMina](https://github.com/listenzz/MyMina)

感谢优秀的作者 `listenzz` 贡献了优秀的思路和实现！

## 最后有些话想说

由于笔者精力有限，还是推荐大家使用 `uni-app` 或者是 `taro` 框架的模板，这个原生模板需要更多的配置升级，才能达到它们那种尽善尽美的状态。
