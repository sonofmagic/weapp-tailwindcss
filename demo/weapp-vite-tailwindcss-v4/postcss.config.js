// import { register } from 'tsx/cjs/api'

// register()
import parity from '../official-postcss-parity-plugin.cjs'

export default {
  plugins: [
    ...parity.createOfficialPostcssParityPlugins(),
    // 'tailwindcss-injector/postcss': {},
    // tailwindcss: {},
    // autoprefixer: {},
    // Tailwind CSS 由 weapp-tailwindcss 生成模式接管
  ],
}
