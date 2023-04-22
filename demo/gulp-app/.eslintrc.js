module.exports = {
  root: true,
  extends: ['@icebreakers/eslint-config-ts'],
  overrides: [
    {
      files: ['*.ts', '*.mts', '*.cts', '*.tsx'],
      rules: {
        'no-undef': 'off'
      }
    }
  ]
}
