# 原生开发(webpack5/gulp)

:::tip
#### 这块建议直接使用下方配置好的原生小程序开发模板

[weapp-native-mina-tailwindcss-template(webpack打包)](https://github.com/sonofmagic/weapp-native-mina-tailwindcss-template)

[weapp-tailwindcss-gulp-template(gulp打包)](https://github.com/sonofmagic/weapp-tailwindcss/tree/main/demo/gulp-app)

给原生小程序加入编译时这块 `webpack/vite/gulp` 等等工具，思路都是一样的，然而实现起来比较复杂损耗精力，在此不提及原理。
:::

## webpack5

直接在 `webpack.config.js` 注册即可

```js
// webpack.config.js
  plugins: [
    new UnifiedWebpackPluginV5({
      appType: 'native',
    }),
  ],
```

具体可以参考 [native-mina方案](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/native-mina)。

## gulp

这个配置稍微繁琐一些

```js
// gulpfile.js

const { createPlugins } = require('weapp-tailwindcss-webpack-plugin/gulp')
// 在 gulp 里使用，先使用 postcss 转化 css，触发 tailwindcss 运行，转化 transformWxss，然后再 transformJs, transformWxml
// createPlugins 参数 options 就是本插件的配置项
const { transformJs, transformWxml, transformWxss } = createPlugins()

// 参考顺序
// transformWxss
function sassCompile() {
  return gulp
    .src(paths.src.scssFiles)
    .pipe(sass({ errLogToConsole: true, outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(postcss())
    .pipe(transformWxss())
    .pipe(
      rename({
        extname: '.wxss'
      })
    )
    .pipe(replace('.scss', '.wxss'))
    .pipe(gulp.dest(paths.dist.baseDir))
}
// transformJs
function compileTsFiles() {
  return gulp.src(paths.src.jsFiles, {}).pipe(plumber()).pipe(tsProject()).pipe(transformJs()).pipe(gulp.dest(paths.dist.baseDir))
}

// transformWxml
function copyWXML() {
  return gulp.src(paths.src.wxmlFiles, {}).pipe(transformWxml()).pipe(gulp.dest(paths.dist.baseDir))
}

// 注意 sassCompile 在 copyWXML 和 compileTsFiles，  这是为了先触发 tailwindcss 处理，从而在运行时获取到上下文
const buildTasks = [cleanTmp, copyBasicFiles, sassCompile, copyWXML, compileTsFiles]
// 注册默认任务 (串行)
gulp.task('default', gulp.series(buildTasks))
```

具体可以参考 [weapp-tailwindcss-gulp-template(gulp打包)](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/gulp-app) 模板项目的配置。

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
