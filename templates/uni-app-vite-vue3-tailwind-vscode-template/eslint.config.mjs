import { icebreaker } from '@icebreakers/eslint-config'

export default icebreaker(
  {
    vue: true,
    tailwindcss: {
      tailwindConfig: './tailwind.config.ts',
    },
    weapp: true,

  },
  {
    // 规则可以在这里禁用
    rules: {
      'better-tailwindcss/no-unregistered-classes': 'off',
    },
  },
)
