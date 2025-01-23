import { getPackageInfoSync } from 'local-pkg'
import { createTailwindcssPatcher } from './patcher'

function getTailwindcssPackageInfo() {
  const tailwindcss = getPackageInfoSync('tailwindcss')
  return tailwindcss
}

export {
  createTailwindcssPatcher,
  getTailwindcssPackageInfo,
}
