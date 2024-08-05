import process from 'node:process'
import { parse } from './parse'
import logger from './logger'

const argv = process.argv.slice(2)

// https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
// https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html

parse(argv).catch((err) => {
  logger.error(err)
})
