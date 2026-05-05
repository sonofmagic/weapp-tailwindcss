export default {
  '**/*.{js,jsx,mjs,ts,tsx,mts,vue}': [
    'eslint --fix --ignore-pattern .agents/** --ignore-pattern **/.agents/** --ignore-pattern e2e/__snapshots__/**',
  ],
  '**/*.{json,md,mdx,css,html,yml,yaml,scss}': [
    'eslint --fix --ignore-pattern .agents/** --ignore-pattern **/.agents/** --ignore-pattern e2e/__snapshots__/**',
  ],
  // for rust
  // '*.rs': ['cargo fmt --'],
}
