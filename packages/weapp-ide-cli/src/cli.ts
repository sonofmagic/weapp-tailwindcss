import process from 'node:process'
import logger from './logger'
import { parse } from './parse'

const argv = process.argv.slice(2)

// https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
// https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html

parse(argv)
  .catch((err) => {
    logger.error(err)
  })
  .finally(() => {
    process.exit()
  })
