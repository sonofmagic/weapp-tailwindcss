module.exports = {
  root: true,
  extends: ['@mpxjs/eslint-config-ts'],
  rules: {
    indent: 0
    // .mpx文件规则 https://mpx-ecology.github.io/eslint-plugin-mpx/rules/
  },
  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        // .ts文件规则 https://typescript-eslint.io/rules/
      }
    },
    {
      files: ['**/*.js'],
      rules: {
        // .js文件规则 https://eslint.bootcss.com/docs/rules/
      }
    }
  ]
}
