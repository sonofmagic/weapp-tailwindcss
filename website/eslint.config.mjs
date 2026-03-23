import { icebreaker } from '@icebreakers/eslint-config'

const config = icebreaker({
  tailwindcss: {
    tailwindConfig: './tailwind.config.ts',
  },
  react: false,
  markdown: false,
}).overrideRules({
  'better-tailwindcss/no-unknown-classes': 'warn',
  'better-tailwindcss/enforce-consistent-line-wrapping': 'warn',
  'better-tailwindcss/enforce-consistent-class-order': 'warn',
})

export default config
