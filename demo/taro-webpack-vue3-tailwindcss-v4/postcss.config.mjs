import parity from '../official-postcss-parity-plugin.cjs'

export default {
  plugins: [
    ...parity.createOfficialPostcssParityPlugins(),
    // Tailwind CSS 由 weapp-tailwindcss 生成模式接管
  ],
}
