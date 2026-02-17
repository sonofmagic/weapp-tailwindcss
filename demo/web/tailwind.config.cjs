module.exports = {
  content: {
    relative: true,
    files: [
      './**/*.{js,cjs,mjs,ts,tsx,html,wxml}',
      '!./node_modules/**/*',
      '!./out.*',
    ],
  },
  darkMode: 'class',
}
