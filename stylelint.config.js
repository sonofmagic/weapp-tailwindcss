import { icebreaker } from '@icebreakers/stylelint-config'

export default icebreaker({
  ignoreFiles: [
    'packages/weapp-tailwindcss/test/fixtures/css/**',
    'packages/weapp-tailwindcss/*.css',
  ],
})
