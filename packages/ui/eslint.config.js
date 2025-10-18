import { icebreaker } from '@icebreakers/eslint-config'

export default icebreaker(
  {
    vue: false,
    typescript: true,
    tailwindcss: {
      entryPoint: 'src/index.css',
    },
    ignores: ['**/fixtures/**'],
  },
)
