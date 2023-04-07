import { createPatch } from '@/tailwindcss/patcher'
import { getOptions } from '@/options'
const args = process.argv.slice(2)

if (args[0] === 'patch') {
  const options = getOptions()

  const patch = createPatch(options.supportCustomLengthUnitsPatch)

  patch()
}
