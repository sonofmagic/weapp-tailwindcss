import process from 'node:process'
import { init } from '@weapp-tailwindcss/init'
import semver from 'semver'
import { getCompilerContext } from '@/context'
import { WEAPP_TW_REQUIRED_NODE_VERSION } from './constants'
import { logger } from './logger'

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
  const ctx = getCompilerContext()
  ctx.twPatcher.patch()
}
else if (command === 'init') {
  init()
}
