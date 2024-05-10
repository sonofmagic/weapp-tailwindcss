import semver from 'semver'
import { createPatch } from '@/tailwindcss/patcher'
import { getOptions } from '@/options'
import { WEAPP_TW_REQUIRED_NODE_VERSION } from '@/constants'

process.title = 'node (weapp-tailwindcss)'
const args = process.argv.slice(2)

if (semver.lt(process.versions.node, WEAPP_TW_REQUIRED_NODE_VERSION)) {
  console.error(
    `You are using Node.js ${process.versions.node}. For weapp-tailwindcss, Node.js version >= v${WEAPP_TW_REQUIRED_NODE_VERSION} is required.`
  )
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1)
}
const command = args[0]
if (command === 'patch') {
  const options = getOptions()
  const patch = createPatch(options.supportCustomLengthUnitsPatch)
  patch()
} else {
  try {
    // @ts-ignore
    import('@weapp-tailwindcss/cli').then(({ createCli }) => {
      createCli().parse()
    })
  } catch (error) {
    console.warn('请先安装 `@weapp-tailwindcss/cli` , 安装完成后再尝试运行！')
    throw error
  }
}
