export default {
  '!(apps|demo)/**/*.{js,jsx,mjs,ts,tsx,mts,vue}': [
    'eslint --fix',
  ],
  '!(apps|demo)/**/*.{json,md,mdx,css,html,yml,yaml,scss}': [
    // 'prettier --with-node-modules --ignore-path .prettierignore --write',
    'eslint --fix',
  ],
  // for rust
  // '*.rs': ['cargo fmt --'],
}
