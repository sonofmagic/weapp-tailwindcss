const { withWeappTailwindcss } = require('@weapp-tailwindcss/react-native/metro')
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

module.exports = withWeappTailwindcss(config, {
  input: './global.css',
  classSet: [
    'flex',
    'items-center',
    'justify-center',
    'w-[180px]',
    'h-[48px]',
    'rounded-lg',
    'bg-blue-500',
    'dark:bg-slate-900',
    'ios:px-4',
    'android:px-2',
    'text-white',
  ],
})
