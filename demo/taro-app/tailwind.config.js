/** @type {import('tailwindcss').Config} */
module.exports = {
  // https://github.com/mrmlnc/fast-glob
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    // 独立分包
    // "!./src/moduleB/**/*.{html,js,ts,jsx,tsx}",
    // "!./src/moduleC/**/*.{html,js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [
    // require('daisyui'),
  ],
  corePlugins: {
    preflight: false
  }
}
// 380.88833299999897 ms
// 184.39737499999865 ms
// 550.0264159999988 ms
// UnifiedWebpackPluginV5 onEnd: 235.58820800000103 ms
// UnifiedWebpackPluginV5 onEnd: 228.3829999999998 ms
// UnifiedWebpackPluginV5 onEnd: 517.1407500000005 ms

// @ast-grep
// UnifiedWebpackPluginV5 onEnd: 95.88620900000024 ms
// UnifiedWebpackPluginV5 onEnd: 79.0297499999997 ms
// UnifiedWebpackPluginV5 onEnd: 241.09116699999868 ms
// UnifiedWebpackPluginV5 onEnd: 89.41974999999911 ms
// UnifiedWebpackPluginV5 onEnd: 71.4153750000005 ms
// UnifiedWebpackPluginV5 onEnd: 210.45887500000026 ms
