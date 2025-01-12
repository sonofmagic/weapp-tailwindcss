import process from 'node:process'
import { init } from '@weapp-tailwindcss/init'
import semver from 'semver'
import { WEAPP_TW_REQUIRED_NODE_VERSION } from './constants'
import { logger } from './logger'
import { getOptions } from './options'

process.title = 'node (weapp-tailwindcss)'
const args = process.argv.slice(2)

if (semver.lt(process.versions.node, WEAPP_TW_REQUIRED_NODE_VERSION)) {
  logger.warn(
    `You are using Node.js ${process.versions.node}. For weapp-tailwindcss, Node.js version >= v${WEAPP_TW_REQUIRED_NODE_VERSION} is required.`,
  )
}
// nodejs 最低版本 '16.6.0' , init 需要 '18.17.0'
const command = args[0]
if (command === 'patch') {
  const ctx = getOptions()
  ctx.twPatcher.patch()
}
else if (command === 'init') {
  init()
}
// 从 weapp-tailwindcss@3.6.0 版本开始移除，原先老的都迁移到 weapp-vite
// https://vite.icebreaker.top/
// else {
//   try {
//     // @ts-ignore
//     import('@weapp-tailwindcss/cli').then(({ createCli }) => {
//       createCli().parse()
//     })
//   }
//   catch (error) {
//     console.warn('请先安装 `@weapp-tailwindcss/cli` , 安装完成后再尝试运行！')
//     throw error
//   }
// }
