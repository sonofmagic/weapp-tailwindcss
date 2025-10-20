const tsx = require('tsx/cjs/api')
tsx.register()
import path from 'node:path'
import process from 'node:process'
import { deleteAsync } from 'del'
import gulp from 'gulp'
import type { TaskFunction, TaskFunctionCallback } from 'gulp'
import debug from 'gulp-debug'
import gulpif from 'gulp-if'
import plumber from 'gulp-plumber'
import postcss from 'gulp-postcss'
import rename from 'gulp-rename'
import replace from 'gulp-replace'
import gulpSass from 'gulp-sass'
import ts from 'gulp-typescript'
import gutil from 'gulp-util'
import dartSass from 'sass'
import { createPlugins } from 'weapp-tailwindcss/gulp'

const isDebug = Boolean(process.env.DEBUG)
const isWatch = Boolean(process.env.WATCH)
// const isLocal = Boolean(process.env.LOCAL)
const useBabel = Boolean(process.env.BABEL)

const platformMap = {
  weapp: {
    template: 'wxml',
    css: 'wxss',
  },
  tt: {
    template: 'ttml',
    css: 'ttss',
  },
}

const platform = (process.env.PLATFORM ?? 'weapp') as keyof typeof platformMap

const platformHit = platformMap[platform]
if (!platformHit) {
  throw new Error(`not support ${platform} platform`)
}

const sass = gulpSass(dartSass)
const tsProject = ts.createProject('tsconfig.json')

// 在 gulp 里使用，先使用 postcss 转化 css，触发 tailwindcss ，然后转化 transformWxss， 然后 transformJs, transformWxml
const { transformJs, transformWxml, transformWxss } = createPlugins({
  rem2rpx: true,
})
// {
//   mangle: true
// }

type StreamTask = NodeJS.ReadWriteStream & { destroyed?: boolean }

function promisify(task: StreamTask) {
  return new Promise<void>((resolve, reject) => {
    if (task.destroyed) {
      resolve()
      return
    }
    const cleanup = () => {
      task.removeListener('finish', onResolve)
      task.removeListener('end', onResolve)
      task.removeListener('error', onError)
    }
    const onResolve = () => {
      cleanup()
      resolve()
    }
    const onError = (error: unknown) => {
      cleanup()
      reject(error)
    }
    task.once('finish', onResolve)
    task.once('end', onResolve)
    task.once('error', onError)
  })
}

// 相关路径配置
const paths = {
  src: {
    baseDir: 'src',
    imgDir: 'src/image',
    spriteDir: 'src/assets/sprites',
    scssDir: 'src/assets/scss',
    imgFiles: 'src/image/**/*',
    scssFiles: 'src/**/*.scss',
    baseFiles: ['src/**/*.{png,jpg,json}'], // , '!src/assets/**/*', '!src/image/**/*'
    assetsDir: 'src/assets',
    assetsImgFiles: 'src/assets/images/**/*.{png,jpg,jpeg,svg,gif}',
    wxmlFiles: `src/**/*.${platformHit.template}`,
    jsFiles: 'src/**/*.{js,ts}',
  },
  dist: {
    baseDir: 'dist',
    imgDir: 'dist/image',
    wxssFiles: `dist/**/*.${platformHit.css}`,
  },
  tmp: {
    baseDir: 'tmp',
    imgDir: 'tmp/assets/images',
    imgFiles: 'tmp/assets/images/**/*.{png,jpg,jpeg,svg,gif}',
  },
}

// Log for output msg.
function log(...args: unknown[]) {
  gutil.log(...args)
}

// Sass 编译
function sassCompile() {
  return gulp
    .src(paths.src.scssFiles)
    .pipe(sass({
      style: 'expanded',
      silenceDeprecations: ['legacy-js-api'],
    }).on('error', sass.logError))
    .pipe(gulpif(isDebug, debug({ title: '`sassCompile` Debug:' })))
    .pipe(postcss())
    .pipe(transformWxss())
    .pipe(
      rename({
        extname: `.${platformHit.css}`,
      }),
    )
    .pipe(replace('.scss', `.${platformHit.css}`))
    .pipe(gulp.dest(paths.dist.baseDir))
}

// 复制基础文件
function copyBasicFiles() {
  return gulp.src(paths.src.baseFiles, {}).pipe(gulp.dest(paths.dist.baseDir))
}

function compileTsFiles() {
  return gulp.src(paths.src.jsFiles, {}).pipe(plumber()).pipe(tsProject()).pipe(transformJs()).pipe(gulp.dest(paths.dist.baseDir))
}

// 复制 WXML
function copyWXML() {
  return gulp.src(paths.src.wxmlFiles, {}).pipe(transformWxml()).pipe(gulp.dest(paths.dist.baseDir))
}

// clean 任务, dist 目录
function cleanDist() {
  return deleteAsync([paths.dist.baseDir])
}

// clean tmp 目录
function cleanTmp() {
  return deleteAsync([paths.tmp.baseDir])
}

const watchHandler = async function (type: 'changed' | 'removed' | 'add', file: string) {
  const extname = path.extname(file)
  // SCSS 文件
  if (extname === '.scss') {
    if (type === 'removed') {
      const tmp = file.replace('src/', 'dist/').replace(extname, `.${platformHit.css}`)
      await deleteAsync([tmp])
    }
    else {
      await promisify(sassCompile())
    }
  }
  // 图片文件
  else if (extname === '.png' || extname === '.jpg' || extname === '.jpeg' || extname === '.svg' || extname === '.gif') {
    if (type === 'removed') {
      if (file.includes('assets')) {
        await deleteAsync([file.replace('src/', 'tmp/')])
      }
      else {
        await deleteAsync([file.replace('src/', 'dist/')])
      }
    }
    else {
      // do sth
    }
  }

  // wxml
  else if (extname === `.${platformHit.template}`) {
    if (type === 'removed') {
      const tmp = file.replace('src/', 'dist/')
      await deleteAsync([tmp])
    }
    else {
      await promisify(sassCompile())
      await promisify(copyWXML())
    }
  }
  else if (extname === '.js' || extname === '.ts') {
    if (type === 'removed') {
      const tmp = file.replace('src/', 'dist/')
      await deleteAsync([tmp])
    }
    else {
      await promisify(sassCompile())
      await promisify(compileTsFiles())
    }
  }

  // 其余文件
  else {
    if (type === 'removed') {
      const tmp = file.replace('src/', 'dist/')
      await deleteAsync([tmp])
    }
    else {
      await promisify(copyBasicFiles())
    }
  }
}

// 监听文件
function watchFiles() {
  const watcher = gulp.watch([paths.src.baseDir, paths.tmp.imgDir], { ignored: /[/\\]\./ })
  watcher
    .on('change', (file) => {
      log(`${gutil.colors.yellow(file)} is changed`)
      void watchHandler('changed', file)
    })
    .on('add', (file) => {
      log(`${gutil.colors.yellow(file)} is added`)
      void watchHandler('add', file)
    })
    .on('unlink', (file) => {
      log(`${gutil.colors.yellow(file)} is deleted`)
      void watchHandler('removed', file)
    })
}

const buildTasks: TaskFunction[] = [
  cleanTmp as TaskFunction,
  copyBasicFiles as TaskFunction,
  sassCompile as TaskFunction,
  copyWXML as TaskFunction,
  compileTsFiles as TaskFunction,
]

if (isWatch) {
  const watchTask: TaskFunction = (done: TaskFunctionCallback) => {
    watchFiles()
    done()
  }
  buildTasks.push(watchTask)
}
// 注册默认任务
gulp.task('default', gulp.series(...buildTasks))

// 删除任务
gulp.task('clean', gulp.parallel(cleanTmp, cleanDist))
