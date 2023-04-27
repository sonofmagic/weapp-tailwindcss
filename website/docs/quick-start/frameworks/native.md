# 原生开发(webpack5/gulp)

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
