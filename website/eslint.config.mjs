import { icebreaker } from '@icebreakers/eslint-config'

const config = icebreaker({
  tailwindcss: {
    tailwindConfig: './tailwind.config.ts',
  },
  react: false,
  markdown: false,
  rules: {
    'better-tailwindcss/no-unregistered-classes': 'warn',
  },
})

export default config
