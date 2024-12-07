import { register } from 'tsx/cjs/api'

register()
export default {
  plugins: {
    'tailwindcss-injector/postcss': {},
    'tailwindcss': {},
    'autoprefixer': {},
  },
}
