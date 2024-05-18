import { icebreaker } from '@icebreakers/eslint-config'

export default icebreaker({}, {
  ignores: [
    '**/fixtures/**',
    'apps',
    'demo',
    'demo-linked',
    'how-to-build-components-by-tailwindcss',
  ],
})
