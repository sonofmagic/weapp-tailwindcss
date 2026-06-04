import { expectType } from 'tsd'
import { WeappTailwindcss } from 'weapp-tailwindcss/webpack'

const webpackPlugin = new WeappTailwindcss({ appType: 'taro' })
expectType<WeappTailwindcss>(webpackPlugin)
