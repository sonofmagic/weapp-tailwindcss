import { defineConfig } from 'windicss/helpers';
// import formsPlugin from 'windicss/plugin/forms';

export default defineConfig({
  extract: {
    include: ['src/**/*.{vue,html,jsx,tsx}'],
    exclude: ['node_modules', '.git'],
  },
  // darkMode: 'class',
  // safelist: 'p-3 p-4 p-5',
  // theme: {
  //   extend: {
  //     colors: {
  //       teal: {
  //         100: '#096',
  //       },
  //     },
  //   },
  // },
  // plugins: [formsPlugin],
});
