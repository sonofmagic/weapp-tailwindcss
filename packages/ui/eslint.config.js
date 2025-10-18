import { icebreaker } from '@icebreakers/eslint-config'

export default icebreaker(
  {
    vue: true,
    typescript: true,
    tailwindcss: {
      entryPoint: 'src/style.css',
    },
    ignores: ['**/fixtures/**'],
  },
)
