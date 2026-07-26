module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@weapp-tailwindcss/react-native/babel', {
        classNameSet: [
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
      }],
    ],
  }
}
