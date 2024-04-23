/* eslint-disable no-useless-escape */
import path from 'path'
import gulp from 'gulp'
import dartSass from 'sass'
import gulpSass from 'gulp-sass'
import rename from 'gulp-rename'
import del from 'del'
import replace from 'gulp-replace'
import postcss from 'gulp-postcss'
import gulpif from 'gulp-if'
import gutil from 'gulp-util'
import debug from 'gulp-debug'
import ts from 'gulp-typescript'
import plumber from 'gulp-plumber'
import type { Transform } from 'stream'
import { createPlugins } from 'weapp-tailwindcss/gulp'
const isDebug = Boolean(process.env.DEBUG)
const isWatch = Boolean(process.env.WATCH)
// const isLocal = Boolean(process.env.LOCAL)
const useBabel = Boolean(process.env.BABEL)

const platformMap = {
  weapp: {
    template: 'wxml',
    css: 'wxss'
  },
  tt: {
    template: 'ttml',
    css: 'ttss'
  }
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
  jsAstTool: useBabel ? 'babel' : 'ast-grep'
})
// {
//   mangle: true
// }

function promisify(task: Transform) {
  return new Promise((resolve, reject) => {
    if (task.destroyed) {
      resolve(undefined)
      return
    }
    task.on('finish', resolve).on('error', reject)
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
    jsFiles: 'src/**/*.{js,ts}'
  },
  dist: {
    baseDir: 'dist',
    imgDir: 'dist/image',
    wxssFiles: `dist/**/*.${platformHit.css}`
  },
  tmp: {
    baseDir: 'tmp',
    imgDir: 'tmp/assets/images',
    imgFiles: 'tmp/assets/images/**/*.{png,jpg,jpeg,svg,gif}'
  }
}

// Log for output msg.
function log(...args: any[]) {
  gutil.log.apply(false, args)
}

// Sass 编译
function sassCompile() {
  return gulp
    .src(paths.src.scssFiles)
    .pipe(sass({ errLogToConsole: true, outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(gulpif(isDebug, debug({ title: '`sassCompile` Debug:' })))
    .pipe(postcss())
    .pipe(transformWxss())
    .pipe(
      rename({
        extname: `.${platformHit.css}`
      })
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
  return del(paths.dist.baseDir)
}

// clean tmp 目录
function cleanTmp() {
  return del(paths.tmp.baseDir)
}

const watchHandler = async function (type: 'changed' | 'removed' | 'add', file: string) {
  const extname = path.extname(file)
  // SCSS 文件
  if (extname === '.scss') {
    if (type === 'removed') {
      const tmp = file.replace('src/', 'dist/').replace(extname, `.${platformHit.css}`)
      del([tmp])
    } else {
      sassCompile()
    }
  }
  // 图片文件
  else if (extname === '.png' || extname === '.jpg' || extname === '.jpeg' || extname === '.svg' || extname === '.gif') {
    if (type === 'removed') {
      if (file.indexOf('assets') > -1) {
        del([file.replace('src/', 'tmp/')])
      } else {
        del([file.replace('src/', 'dist/')])
      }
    } else {
      // do sth
    }
  }

  // wxml
  else if (extname === `.${platformHit.template}`) {
    if (type === 'removed') {
      const tmp = file.replace('src/', 'dist/')
      del([tmp])
    } else {
      // @ts-ignore
      await promisify(sassCompile())
      // @ts-ignore
      await promisify(copyWXML())
    }
  } else if (extname === '.js' || extname === '.ts') {
    if (type === 'removed') {
      const tmp = file.replace('src/', 'dist/')
      del([tmp])
    } else {
      // @ts-ignore
      await promisify(sassCompile())
      // @ts-ignore
      await promisify(compileTsFiles())
    }
  }

  // 其余文件
  else {
    if (type === 'removed') {
      const tmp = file.replace('src/', 'dist/')
      del([tmp])
    } else {
      copyBasicFiles()
    }
  }
}

// 监听文件
function watch() {
  const watcher = gulp.watch([paths.src.baseDir, paths.tmp.imgDir], { ignored: /[\/\\]\./ })
  watcher
    .on('change', function (file) {
      log(gutil.colors.yellow(file) + ' is changed')
      watchHandler('changed', file)
    })
    .on('add', function (file) {
      log(gutil.colors.yellow(file) + ' is added')
      watchHandler('add', file)
    })
    .on('unlink', function (file) {
      log(gutil.colors.yellow(file) + ' is deleted')
      watchHandler('removed', file)
    })
}

const buildTasks = [cleanTmp, copyBasicFiles, sassCompile, copyWXML, compileTsFiles]
if (isWatch) {
  // @ts-ignore
  buildTasks.push(watch)
}
// 注册默认任务
gulp.task('default', gulp.series(buildTasks))

// 删除任务
gulp.task('clean', gulp.parallel(cleanTmp, cleanDist))
