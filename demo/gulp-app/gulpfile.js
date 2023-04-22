/* eslint-disable no-useless-escape */
const path = require('path')
const gulp = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const rename = require('gulp-rename')
// var imagemin = require('gulp-imagemin');
// const sftp = require('gulp-sftp')
const del = require('del')
const replace = require('gulp-replace')
const postcss = require('gulp-postcss')
const qcloudUpload = require('gulp-qcloud-upload')
const gulpif = require('gulp-if')
const gutil = require('gulp-util')
// const newer = require('gulp-newer')
const cache = require('gulp-cached')
const debug = require('gulp-debug')

const { createPlugins } = require('./weapp-tw-dist/gulp')
const { transformJs, transformWxml, transformWxss } = createPlugins()
// const pxtorpx = require('postcss-px2rpx')
// const base64 = require('postcss-font-base64')
// var lazysprite = require('postcss-lazysprite');
const argv = require('yargs').argv
let config = null

function promisify(task) {
  return new Promise((resolve, reject) => {
    task.on('finish', resolve).on('error', reject)
  })
}
// 获取用户配置
try {
  config = require('./config.custom.js')
} catch (e) {
  try {
    config = require('./config.js')
  } catch (e) {
    log(gutil.colors.red('丢失配置文件(config.js/config.custom.js)'))
  }
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
    baseFiles: ['src/**/*.{png,json}'], // , '!src/assets/**/*', '!src/image/**/*'
    assetsDir: 'src/assets',
    assetsImgFiles: 'src/assets/images/**/*.{png,jpg,jpeg,svg,gif}',
    wxmlFiles: 'src/**/*.wxml',
    jsFiles: 'src/**/*.js'
  },
  dist: {
    baseDir: 'dist',
    imgDir: 'dist/image',
    wxssFiles: 'dist/**/*.wxss'
  },
  tmp: {
    baseDir: 'tmp',
    imgDir: 'tmp/assets/images',
    imgFiles: 'tmp/assets/images/**/*.{png,jpg,jpeg,svg,gif}'
  }
}

// 雪碧图的配置
// const lazyspriteConfig = {
//   imagePath: paths.src.spriteDir,
//   stylesheetInput: paths.src.scssDir,
//   stylesheetRelative: paths.src.assetsDir,
//   spritePath: paths.src.assetsDir + '/images',
//   smartUpdate: false,
//   cssSeparator: '-',
//   outputExtralCSS: true,
//   nameSpace: 'icon-'
// }

// Log for output msg.
function log() {
  const data = Array.prototype.slice.call(arguments)
  gutil.log.apply(false, data)
}

// 压缩图片
// function imageMin() {
// 	// return gulp.src(paths.src.imgFiles, {si≤nce: gulp.lastRun(imageMin)})
// 	return gulp.src(paths.src.imgFiles)
// 		.pipe(newer(paths.dist.imgDir))
// 		.pipe(imagemin({
// 			progressive: true,
// 			svgoPlugins: [{removeViewBox: false}]
// 		}))
// 		.pipe(gulp.dest(paths.dist.imgDir));
// }

// assets 文件夹下的图片处理
// function assetsImgMin() {
//   return (
//     gulp
//       .src(paths.src.assetsImgFiles)
//       .pipe(newer(paths.tmp.imgDir))
//       // .pipe(imagemin({
//       // 	progressive: true,
//       // 	svgoPlugins: [{removeViewBox: false}]
//       // }))
//       .pipe(gulp.dest(paths.tmp.imgDir))
//   )
// }

// Sass 编译
function sassCompile() {
  const res = config.assetsCDN + config.qcloud.prefix + '/'
  // lazysprite(lazyspriteConfig),
  return gulp
    .src(paths.src.scssFiles)
    .pipe(sass({ errLogToConsole: true, outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(gulpif(Boolean(argv.debug), debug({ title: '`sassCompile` Debug:' })))
    .pipe(postcss())
    .pipe(transformWxss())
    .pipe(
      rename({
        extname: '.wxss'
      })
    )
    .pipe(replace('.scss', '.wxss'))
    .pipe(replace('%ASSETS_IMG%/', res))
    .pipe(replace('src/assets/images', res)) // 雪碧图CSS RUL 中的图片路径
    .pipe(gulp.dest(paths.dist.baseDir))
}

// 复制基础文件
function copyBasicFiles() {
  return gulp.src(paths.src.baseFiles, {}).pipe(gulp.dest(paths.dist.baseDir))
}

function copyJsFiles() {
  return gulp.src(paths.src.jsFiles, {}).pipe(transformJs()).pipe(gulp.dest(paths.dist.baseDir))
}

// 复制 WXML
function copyWXML() {
  return gulp.src(paths.src.wxmlFiles, {}).pipe(transformWxml()).pipe(gulp.dest(paths.dist.baseDir))
}

// 重写WXML 中 image 标签中的图片路径
// function wxmlImgRewrite() {
//   const res = config.assetsCDN + config.qcloud.prefix + '/'
//   // console.log(res);
//   return gulp.src(paths.src.wxmlFiles).pipe(replace('%ASSETS_IMG%/', res)).pipe(gulp.dest(paths.dist.baseDir))
// }

// clean 任务, dist 目录
function cleanDist() {
  return del(paths.dist.baseDir)
}

// clean tmp 目录
function cleanTmp() {
  return del(paths.tmp.baseDir)
}

// 腾讯云上传任务
function qcloudCDN(cb) {
  if (config.enabledQcloud) {
    // return gulp.src(paths.src.assetsImgFiles, {since: gulp.lastRun(qcloudCDN)})
    return gulp
      .src(paths.tmp.imgFiles)
      .pipe(cache('qcloudCache'))
      .pipe(
        qcloudUpload({
          appid: config.qcloud.appid,
          secretId: config.qcloud.secretId,
          secretKey: config.qcloud.secretKey,
          bucket: config.qcloud.bucket,
          region: config.qcloud.region,
          prefix: config.qcloud.prefix,
          overWrite: config.qcloud.overWrite,
          headers: config.qcloud.headers
        })
      )
  }
  cb && cb()
}

const watchHandler = async function (type, file) {
  const extname = path.extname(file)
  // SCSS 文件
  if (extname === '.scss') {
    if (type === 'removed') {
      const tmp = file.replace('src/', 'dist/').replace(extname, '.wxss')
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
      // assetsImgMin()
      await promisify(qcloudCDN())
      // await promisify(wxmlImgRewrite())

      // imageMin();
    }
  }

  // wxml
  else if (extname === '.wxml') {
    if (type === 'removed') {
      const tmp = file.replace('src/', 'dist/')
      del([tmp])
    } else {
      await promisify(sassCompile())
      await promisify(copyWXML())
      // await promisify(wxmlImgRewrite())
    }
  } else if (extname === '.js') {
    if (type === 'removed') {
      const tmp = file.replace('src/', 'dist/')
      del([tmp])
    } else {
      await promisify(sassCompile())
      await promisify(copyJsFiles())
    }
  }

  // 其余文件
  else {
    if (type === 'removed') {
      const tmp = file.replace('src/', 'dist/')
      del([tmp])
    } else {
      copyBasicFiles()
      // copyWXML();
      // wxmlImgRewrite();
    }
  }
}

// 监听文件
function watch(cb) {
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

  cb()
}

// 注册默认任务
gulp.task(
  'default',
  gulp.series(
    cleanTmp,
    copyBasicFiles,
    // gulp.parallel(
    //   sassCompile,
    //   // imageMin,

    // ),
    sassCompile,
    copyWXML,
    copyJsFiles,
    // wxmlImgRewrite
    // assetsImgMin,
    // qcloudCDN,
    watch
  )
)

// 注册测试任务
gulp.task(
  'test',
  gulp.series(
    cleanTmp,
    copyBasicFiles,
    gulp.parallel(
      sassCompile,
      // imageMin,
      copyWXML
    ),
    // wxmlImgRewrite,
    // assetsImgMin,
    qcloudCDN
  )
)

// 删除任务
gulp.task('clean', gulp.parallel(cleanTmp, cleanDist))
