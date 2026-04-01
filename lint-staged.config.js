export default {
  '**/*.{js,jsx,mjs,ts,tsx,mts,vue}': [
    'eslint --fix --ignore-pattern .agents/** --ignore-pattern **/.agents/**',
  ],
  '**/*.{json,md,mdx,css,html,yml,yaml,scss}': [
    'eslint --fix --ignore-pattern .agents/** --ignore-pattern **/.agents/**',
  ],
  // for rust
  // '*.rs': ['cargo fmt --'],
}
