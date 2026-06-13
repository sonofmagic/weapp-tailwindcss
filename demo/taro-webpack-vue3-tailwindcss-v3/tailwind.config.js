const themeVariants = require('../theme-variants.cjs')

/** @type {import('tailwindcss').Config} */
module.exports = {
  // https://github.com/mrmlnc/fast-glob
  content: [
    "./src/**/*.{html,js,ts,vue}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [
    themeVariants,
    // require('daisyui'),
  ],
  corePlugins: {
    preflight: false
  }
}
// 380.88833299999897 ms
// 184.39737499999865 ms
// 550.0264159999988 ms
// WeappTailwindcss onEnd: 235.58820800000103 ms
// WeappTailwindcss onEnd: 228.3829999999998 ms
// WeappTailwindcss onEnd: 517.1407500000005 ms

// @ast-grep
// WeappTailwindcss onEnd: 95.88620900000024 ms
// WeappTailwindcss onEnd: 79.0297499999997 ms
// WeappTailwindcss onEnd: 241.09116699999868 ms
// WeappTailwindcss onEnd: 89.41974999999911 ms
// WeappTailwindcss onEnd: 71.4153750000005 ms
// WeappTailwindcss onEnd: 210.45887500000026 ms
