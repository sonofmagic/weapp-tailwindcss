module.exports = {
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
