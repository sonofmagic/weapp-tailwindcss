---
title: The native Toutiao applet uses TailWindCSS
description: Create the project test-miniapp, enter the project directory and initialize package.json
keywords:
  - FAQ
  - Troubleshooting
  - compatibility
  - Use of native Toutiao applet
  - TailWindCSS
  - issues
  - native toutiao
  - weapp-tailwindcss
  - Mini program
  - WeChat applet
  - uni-app
  - taro
  - mpx
---

# The native Toutiao applet uses TailWindCSS

> The following content is provided by enthusiastic netizens who use `weapp-tailwindcss`. Thank you very much!

## Create project

Create project `test-miniapp`, enter the project directory and initialize `package.json`

```sh
cd test-miniapp
npm init -y
```

Create a new mini program development directory `src`, corresponding mini program code, and generate the target code directory as `dist`

At this time the directory structure is as follows:

```
test-miniapp
-- src
-- dist
-- package.json
```

## Install gulp and plug-ins

- Local installation `gulp`

```sh
npm i -D gulp
```

- Install gulp modules and plug-ins

```sh
npm i -D gulp gulp-postcss gulp-plumber del@^6
```

## Install and configure tailwindcss

- Install Tailwind CSS and weapp-tailwindcss

```sh
npm i -D tailwindcss weapp-tailwindcss
```

- Tailwind-specific `postcss.config.js` is no longer created

`weapp-tailwindcss@5` The builder plugin takes over Tailwind CSS generation by default. If the project already has PostCSS configuration, only keep the business's own non-Tailwind plug-ins.

- Code introduction `tailwindcss`, open `src/app.ttss`

```css
@import "tailwindcss";
@source "./**/*.{ttml,js}";
@source not "../dist";
```

The current documentation only maintains Tailwind CSS 4 access instructions.

## Configure vscode plug-in

### Prettier - Code formatter

Install plugin

```sh
npm i -D prettier prettier-plugin-tailwindcss
```

Configure `prettier.config.js`

```js
module.exports = {
//Add semicolon at the end of the line
  semi: false,
// use single quotes
  singleQuote: true,
//Configuration file type
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

Include the applet files and set: `Preferences->workspace->set up->Expand->Prettier->Prettier: Document Selectors`

```txt
**/*.ttml
**/*.ttss
```

- Byte applet development assistant (WeChat applet is this: WXML - Language Service)

### Tailwind CSS IntelliSense

And configure: `Preferences->workspace->set up->Expand->Tailwind CSS IntelliSense->Tailwind CSS: Include Languages`

```
Item: ttml, value: html
```

### Gulp Tasks

- Gulp Tasks

Install plugin

```sh npm2yarn
npm install -D weapp-tailwindcss
```

When configuring `gulpfile.js`, it is important to note that after the panel executes `serve`, even if the task is stopped later, the monitor `watch` in the program will not stop, so that after `serve` is subsequently started, there will be multiple monitors `watch` and multiple monitor handlers `watchHandler` to process files repeatedly. Therefore, after stopping and then starting `serve`, you should close `vscode` and then reopen it.

```js
const { src, dest, series, parallel, task, watch } = require('gulp')
const postcss = require('gulp-postcss')
const plumber = require('gulp-plumber')
const path = require('path')
const del = require('del')
const tailwindcssGulp = require('weapp-tailwindcss/gulp')

// Used in gulp, first use postcss to convert css, trigger tailwindcss, then convert transformWxss, and finally convert transformJs, transformWxml
const {
  transformJs,
  transformWxml: transformHtml,
  transformWxss: transformCss,
} = tailwindcssGulp.createPlugins({
  cssOptions: {
    rem2rpx: true,
  },
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

// type values: changed, added, deleted
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

//Register service task
task('serve', series(...buildTasks, watchTask))

//Register cleanup task
task('clean', parallel(clean))
```
