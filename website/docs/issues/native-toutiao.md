# 原生头条小程序使用 TailWindCSS

> 以下内容由使用 `weapp-tailwindcss` 的热心网友提供，十分感谢！

## 创建项目

创建项目 `test-miniapp` 并进入项目目录并初始化 `package.json`。

```sh
cd test-miniapp
npm init -y
```

新建小程序开发目录 `src`，对应的小程序代码，生成目标代码目录为 `dist`。

此时目录结构如下所示：

```
-- test-miniapp
  -- src
  -- dist
  -- package.json
```

## 安装 gulp 及插件

- 本地安装 `gulp`

```sh
npm i -D gulp
```

- 安装 `gulp` 模块及插件

```sh
npm i -D gulp gulp-postcss gulp-plumber del@^6
```

## 安装与配置 tailwindcss

- 安装 `tailwindcss`

```sh
npm i -D tailwindcss postcss autoprefixer
```

- 初始化 `tailwindcss` 配置文件

```sh
npx tailwindcss init
```

- 创建 `postcss.config.js` 并注册 `tailwindcss`

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    // 假如框架已经内置了 `autoprefixer`，可以去除下一行
    autoprefixer: {},
  }
}
```

- 配置 `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // 不在 content 包括的文件内的 class，不会生成对应的 css 工具类
  content: ['./src/**/*.{ttml,js}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- 代码引入 `tailwindcss`，打开 `src/app.ttss`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 配置 vscode 插件

### Prettier - Code formatter

安装插件

```sh
npm i -D prettier prettier-plugin-tailwindcss
```

配置 `prettier.config.js`

```js
module.exports = {
  // 行尾加分号
  semi: false,
  // 使用单引号
  singleQuote: true,
  // 配置文件类型
  overrides: [
    {
      files: '*.ttml',
      options: { parser: 'html' },
    },
    {
      files: '*.ttss',
      options: { parser: 'css' },
    },
  ],
  plugins: ['prettier-plugin-tailwindcss'],
}
```

将小程序的文件包括进来，设置：`首选项->工作区->设置->扩展->Prettier->Prettier: Document Selectors`

```txt
**/*.ttml
**/*.ttss
```

- 字节小程序开发助手（微信小程序是这个：WXML - Language Service）

### Tailwind CSS IntelliSense

并配置：`首选项->工作区->设置->扩展->Tailwind CSS IntelliSense->Tailwind CSS: Include Languages`

```
项：ttml，值：html
```

### Gulp Tasks

- Gulp Tasks

  安装插件

  ```sh
  npm i -D weapp-tailwindcss-webpack-plugin
  ```
  
  配置 `gulpfile.js`，需要注意的是，在面板执行 `serve` 后，即使后来停止了任务，程序里的监听 `watch` 也不会停，使得后续再启动 `serve` 后，会有多个监听 `watch` 和多个监听处理程序 `watchHandler`，重复处理文件。所以停止后再启动 `serve`，应该关闭 `vscode` 后重新打开。
  
  ```js
  const { src, dest, series, parallel, task, watch } = require('gulp')
  const postcss = require('gulp-postcss')
  const plumber = require('gulp-plumber')
  const path = require('path')
  const del = require('del')
  const tailwindcssGulp = require('weapp-tailwindcss-webpack-plugin/gulp')
  
  // 在 gulp 里使用, 先使用 postcss 转化 css, 触发 tailwindcss，然后转化 transformWxss，最后转化 transformJs, transformWxml
  const {
    transformJs,
    transformWxml: transformHtml,
    transformWxss: transformCss,
  } = tailwindcssGulp.createPlugins({
    rem2rpx: true,
  })
  
  const config = {
    srcDir: 'src',
    distDir: 'dist',
    cssExt: '.ttss',
    jsExt: '.js',
    htmlExt: '.ttml',
  }
  
  function transformCssFiles() {
    return src(`${config.srcDir}/**/*${config.cssExt}`)
      .pipe(plumber())
      .pipe(postcss())
      .pipe(transformCss())
      .pipe(dest(`${config.distDir}`))
  }
  
  function transformJsFiles() {
    return src(`${config.srcDir}/**/*${config.jsExt}`)
      .pipe(plumber())
      .pipe(transformJs())
      .pipe(dest(`${config.distDir}`))
  }
  
  function transformHtmlFiles() {
    return src(`${config.srcDir}/**/*${config.htmlExt}`)
      .pipe(plumber())
      .pipe(transformHtml())
      .pipe(dest(`${config.distDir}`))
  }
  
  function copyOtherFiles() {
    return src([
      `${config.srcDir}/**/*`,
      `!${config.srcDir}/**/*${config.cssExt}`,
      `!${config.srcDir}/**/*${config.jsExt}`,
      `!${config.srcDir}/**/*${config.htmlExt}`,
    ]).pipe(dest(`${config.distDir}`))
  }
  
  function promisify(task) {
    return new Promise((resolve, reject) => {
      if (task.destroyed) {
        resolve(undefined)
        return
      }
      task.on('finish', resolve).on('error', reject)
    })
  }
  
  // type 取值: changed, added, deleted
  async function watchHandler(type, file) {
    if (type == 'deleted') {
      await del([
        file.replace(
          `${config.srcDir}${path.sep}`,
          `${config.distDir}${path.sep}`
        ),
      ])
    } else {
      const extName = path.extname(file)
      switch (extName) {
        case config.cssExt:
          await promisify(transformCssFiles())
          break
  
        case config.jsExt:
          await promisify(transformCssFiles())
          await promisify(transformJsFiles())
          break
  
        case config.htmlExt:
          await promisify(transformCssFiles())
          await promisify(transformHtmlFiles())
          break
  
        default:
          await promisify(copyOtherFiles())
      }
    }
  }
  
  function watchTask() {
    const watcher = watch([`${config.srcDir}/**/*`])
    watcher
      .on('change', function (file) {
        console.log(`${file} is changed`)
        watchHandler('changed', file)
      })
      .on('add', function (file) {
        console.log(`${file} is added`)
        watchHandler('added', file)
      })
      .on('unlink', function (file) {
        console.log(`${file} is deleted`)
        watchHandler('deleted', file)
      })
  }
  
  function clean() {
    return del(config.distDir, { force: true })
  }
  
  const buildTasks = [
    transformCssFiles,
    transformJsFiles,
    transformHtmlFiles,
    copyOtherFiles,
  ]
  
  // 注册服务任务
  task('serve', series(...buildTasks, watchTask))
  
  // 注册清除任务
  task('clean', parallel(clean))
  ```
