// https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/src/utilities.ts

function property(ident: string, initialValue?: string, _syntax?: string) {
  return {
    prop: ident,
    value: initialValue || '',
  }
}

const nullShadow = '0 0 #0000'

// atRoot
const nodes = [
  // https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/src/utilities.ts#L1137
  property('--tw-border-spacing-x', '0', '<length>'),
  property('--tw-border-spacing-y', '0', '<length>'),
  // https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/src/utilities.ts#L1205
  property('--tw-translate-x', '0'),
  property('--tw-translate-y', '0'),
  property('--tw-translate-z', '0'),
  // https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/src/utilities.ts#L1285
  property('--tw-scale-x', '1'),
  property('--tw-scale-y', '1'),
  property('--tw-scale-z', '1'),
  // https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/src/utilities.ts#L1424
  property('--tw-rotate-x'),
  property('--tw-rotate-y'),
  property('--tw-rotate-z'),
  property('--tw-skew-x'),
  property('--tw-skew-y'),
  // https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/src/utilities.ts#L1641C13-L1641C88
  property('--tw-pan-x'),
  property('--tw-pan-y'),
  property('--tw-pinch-zoom'),
  // https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/src/utilities.ts#L1688C38-L1688C95
  property('--tw-scroll-snap-strictness', 'proximity', '*'),
  // https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/src/utilities.ts#L1688C38-L1688C95
  property('--tw-space-x-reverse', '0'),
  property('--tw-space-y-reverse', '0'),
  // https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/src/utilities.ts#L2169C22-L2169C60
  property('--tw-border-style', 'solid'),
  property('--tw-divide-x-reverse', '0'),
  property('--tw-divide-y-reverse', '0'),
  property('--tw-gradient-position', 'initial'),
  property('--tw-gradient-from', '#0000', '<color>'),
  property('--tw-gradient-via', '#0000', '<color>'),
  property('--tw-gradient-to', '#0000', '<color>'),
  property('--tw-gradient-stops', 'initial'),
  property('--tw-gradient-via-stops', 'initial'),
  property('--tw-gradient-from-position', '0%', '<length-percentage>'),
  property('--tw-gradient-via-position', '50%', '<length-percentage>'),
  property('--tw-gradient-to-position', '100%', '<length-percentage>'),
  property('--tw-mask-linear', 'linear-gradient(#fff, #fff)'),
  property('--tw-mask-radial', 'linear-gradient(#fff, #fff)'),
  property('--tw-mask-conic', 'linear-gradient(#fff, #fff)'),
  property('--tw-mask-left', 'linear-gradient(#fff, #fff)'),
  property('--tw-mask-right', 'linear-gradient(#fff, #fff)'),
  property('--tw-mask-bottom', 'linear-gradient(#fff, #fff)'),
  property('--tw-mask-top', 'linear-gradient(#fff, #fff)'),
  property('--tw-mask-linear-position', '0deg'),
  property('--tw-mask-linear-from-position', '0%'),
  property('--tw-mask-linear-to-position', '100%'),
  property('--tw-mask-linear-from-color', 'black'),
  property('--tw-mask-linear-to-color', 'transparent'),
  property('--tw-mask-radial-from-position', '0%'),
  property('--tw-mask-radial-to-position', '100%'),
  property('--tw-mask-radial-from-color', 'black'),
  property('--tw-mask-radial-to-color', 'transparent'),
  property('--tw-mask-radial-shape', 'ellipse'),
  property('--tw-mask-radial-size', 'farthest-corner'),
  property('--tw-mask-radial-position', 'center'),
  property('--tw-mask-conic-position', '0deg'),
  property('--tw-mask-conic-from-position', '0%'),
  property('--tw-mask-conic-to-position', '100%'),
  property('--tw-mask-conic-from-color', 'black'),
  property('--tw-mask-conic-to-color', 'transparent'),
  property('--tw-font-weight'),
  property('--tw-blur'),
  property('--tw-brightness'),
  property('--tw-contrast'),
  property('--tw-grayscale'),
  property('--tw-hue-rotate'),
  property('--tw-invert'),
  property('--tw-opacity'),
  property('--tw-saturate'),
  property('--tw-sepia'),
  property('--tw-drop-shadow'),
  property('--tw-drop-shadow-color'),
  property('--tw-drop-shadow-alpha', '100%', '<percentage>'),
  property('--tw-drop-shadow-size'),
  property('--tw-backdrop-blur'),
  property('--tw-backdrop-brightness'),
  property('--tw-backdrop-contrast'),
  property('--tw-backdrop-grayscale'),
  property('--tw-backdrop-hue-rotate'),
  property('--tw-backdrop-invert'),
  property('--tw-backdrop-opacity'),
  property('--tw-backdrop-saturate'),
  property('--tw-backdrop-sepia'),
  property('--tw-duration', 'initial'),
  property('--tw-ease', 'initial'),
  property('--tw-content', '""'),
  property('--tw-contain-size'),
  property('--tw-contain-layout'),
  property('--tw-contain-paint'),
  property('--tw-contain-style'),
  property('--tw-leading'),
  property('--tw-tracking'),
  property('--tw-ordinal'),
  property('--tw-slashed-zero'),
  property('--tw-numeric-figure'),
  property('--tw-numeric-spacing'),
  property('--tw-numeric-fraction'),
  property('--tw-outline-style', 'solid'),
  property('--tw-text-shadow-color', 'initial'),
  property('--tw-text-shadow-alpha', '100%', '<percentage>'),
  property('--tw-shadow', nullShadow),
  property('--tw-shadow-color', 'initial'),
  property('--tw-shadow-alpha', '100%', '<percentage>'),
  property('--tw-inset-shadow', nullShadow),
  property('--tw-inset-shadow-color', 'initial'),
  property('--tw-inset-shadow-alpha', '100%', '<percentage>'),
  property('--tw-ring-color'),
  property('--tw-ring-shadow', nullShadow),
  property('--tw-inset-ring-color'),
  property('--tw-inset-ring-shadow', nullShadow),

  // Legacy
  property('--tw-ring-inset'),
  property('--tw-ring-offset-width', '0px', '<length>'),
  property('--tw-ring-offset-color', '#fff'),
  property('--tw-ring-offset-shadow', nullShadow),
]

for (const edge of ['top', 'right', 'bottom', 'left'] as const) {
  nodes.push(
    property(`--tw-mask-${edge}-from-position`, '0%'),
    property(`--tw-mask-${edge}-to-position`, '100%'),
    property(`--tw-mask-${edge}-from-color`, 'black'),
    property(`--tw-mask-${edge}-to-color`, 'transparent'),
  )
}

export default nodes
