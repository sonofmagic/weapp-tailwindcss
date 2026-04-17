import rootConfig from '../../stylelint.config.js'

export default {
  ...rootConfig,
  rules: {
    ...(rootConfig.rules ?? {}),
    // 这组 CSS 主要是上游静态 reset 资源，保留其原始语义比强行改写更重要。
    'comment-empty-line-before': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'declaration-block-no-shorthand-property-overrides': null,
    'declaration-empty-line-before': null,
    'font-family-no-duplicate-names': null,
    'order/properties-order': null,
    'property-no-deprecated': null,
    'property-no-vendor-prefix': null,
    'rule-empty-line-before': null,
    'selector-no-vendor-prefix': null,
    'selector-pseudo-element-colon-notation': null,
    'selector-type-no-unknown': null,
    'value-keyword-case': null,
    'value-no-vendor-prefix': null,
  },
}
