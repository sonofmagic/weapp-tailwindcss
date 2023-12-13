import semver from 'semver'
import { createPatch } from '@/tailwindcss/patcher'
import { getOptions } from '@/options'
const args = process.argv.slice(2)
const WEAPP_TW_REQUIRED_NODE_VERSION = '16.6.0'

if (semver.lt(process.versions.node, WEAPP_TW_REQUIRED_NODE_VERSION)) {
  console.error(`You are using Node.js ${process.versions.node}. For weapp-tailwindcss, Node.js version >= v${WEAPP_TW_REQUIRED_NODE_VERSION} is required.`)
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1)
}

if (args[0] === 'patch') {
  const options = getOptions()
  const patch = createPatch(options.supportCustomLengthUnitsPatch)

  patch()
}
