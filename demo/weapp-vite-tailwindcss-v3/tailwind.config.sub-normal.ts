import type { Config } from 'tailwindcss'

export default <Config>{
  content: ['./miniprogram/sub-normal/**/*.{wxml,html,js,ts,jsx,tsx,vue,mpx}'],
  theme: {
    extend: {
      colors: {
        'normal-subpackage-marker': '#2563eb',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
}
