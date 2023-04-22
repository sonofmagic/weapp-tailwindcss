
#### webpack5

直接在 `webpack.config.js` 注册即可

```js
// webpack.config.js
  plugins: [
    new UnifiedWebpackPluginV5({
      appType: 'native',
    }),
  ],
```

#### gulp

这个配置稍微繁琐一些

```js
// gulpfile.js

const { createPlugins } = require('weapp-tailwindcss-webpack-plugin/gulp')
// 在 gulp 里使用，先使用 postcss 转化 css，触发 tailwindcss 运行，转化 transformWxss，然后再 transformJs, transformWxml
// createPlugins 的 options 就是本插件的配置
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
