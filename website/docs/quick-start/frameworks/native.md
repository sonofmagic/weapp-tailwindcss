# 原生开发(打包方案)

> 注意！这是原生开发(打包方案)，假如你需要纯原生方案，请查看 [快速开始(纯原生)](/docs/quick-start/native/install)

由于原生小程序没有 `webpack/vite/gulp` 工具链，所以我们要添加这一套机制，来整个前端社区接轨，以此来实现更强大的功能。

:::tip
给原生小程序加入编译时这块 `webpack/vite/gulp` 等等工具，思路都是一样的，然而实现起来比较复杂，损耗精力，在此不提及原理。

更改模板工具链流程前，请确保你比较熟悉工具链开发（到我这样的水平就差不多了）。

另外这些模板，只需要稍微改一下产物后缀，添加 `tailwind.config.js` 的 `content` 就可以适配百度，头条，京东...各个平台。
:::

## gulp 模板

模板项目 [weapp-tailwindcss-gulp-template(gulp打包)](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/gulp-app)

## webpack5 模板

模板项目 [weapp-native-mina-tailwindcss-template(webpack打包)](https://github.com/sonofmagic/weapp-native-mina-tailwindcss-template)

## 组件样式的隔离性

:::tip
发现很多用户，在使用原生开发的时候，经常会问，为什么样式不生效。

这可能有以下几个原因:

1. 代码文件不在 `tailwind.config.js` 的 `content` 配置内
2. 原生小程序组件是默认开启 **组件样式隔离** 的，默认情况下，自定义组件的样式只受到自定义组件 wxss 的影响。而 `tailwindcss` 生成的工具类，都在 `app.wxss` 这个全局样式文件里面。不属于组件内部，自然不生效。

这时候可以使用:

```js
/* 组件 custom-component.js */
Component({
  options: {
    addGlobalClass: true,
  }
})
```

来让组件应用到 `app.wxss` 里的样式。

[微信小程序相关开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/wxml-wxss.html#%E7%BB%84%E4%BB%B6%E6%A0%B7%E5%BC%8F%E9%9A%94%E7%A6%BB)

:::

## vscode tailwindcss 智能提示设置

我们知道 `tailwindcss` 最佳实践，是要结合 `vscode`/`webstorm`提示插件一起使用的。

假如你遇到了，在 `vscode` 的 `wxml` 文件中，编写 `class` 没有出智能提示的情况，可以参考以下步骤。

这里我们以 `vscode` 为例:

1. 安装 [`WXML - Language Services 插件`](https://marketplace.visualstudio.com/items?itemName=qiu8310.minapp-vscode)(一搜 wxml 下载量最多的就是了)

2. 安装 [`Tailwind CSS IntelliSense 插件`](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

接着找到 `Tailwind CSS IntelliSense` 的 `扩展设置`

在 `include languages`,手动标记 `wxml` 的类型为 `html`

![如图所示](./img/vscode-setting.png)

智能提示就出来了:

![智能提示](./img/wxml-i.png)
