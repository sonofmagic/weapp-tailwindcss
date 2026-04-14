import type { Config } from 'tailwind-merge'
import { fromTheme, validators } from 'tailwind-merge'

const {
  isAny,
  isArbitraryLength,
  isArbitraryNumber,
  isArbitraryPosition,
  isArbitrarySize,
  isArbitraryValue,
  isInteger,
  isLength,
  isNumber,
  isPercent,
  isTshirtSize,
} = validators

/**
 * 精简版 tailwind-merge v2 配置，仅包含小程序场景中高频使用的 Tailwind 类冲突分组。
 *
 * 包含类别：布局、Flexbox、Grid、对齐、间距、尺寸、排版、背景、边框、效果、变换、过渡、交互、定位
 * 排除类别：SVG、表格、滚动捕捉、触摸操作、遮罩、透视、容器查询、列、分页、装饰断行、
 *           滚动行为覆盖、屏幕阅读器、宽高比、容器、强制颜色调整、will-change、行截断、
 *           字体变体数字、渐变、滤镜/背景滤镜、强调色、光标颜色、外观
 */
export function getSlimConfig(): Config<string, string> {
  const themeColors = fromTheme('colors')
  const themeSpacing = fromTheme('spacing')
  const themeBorderRadius = fromTheme('borderRadius')
  const themeBorderWidth = fromTheme('borderWidth')
  const themeGap = fromTheme('gap')
  const themeInset = fromTheme('inset')
  const themeMargin = fromTheme('margin')
  const themeOpacity = fromTheme('opacity')
  const themePadding = fromTheme('padding')
  const themeScale = fromTheme('scale')
  const themeTranslate = fromTheme('translate')
  const themeSpace = fromTheme('space')

  /** 溢出值 */
  const scaleOverflow = (): any[] => ['auto', 'hidden', 'clip', 'visible', 'scroll']
  /** Grid 模板列/行 */
  const scaleGridTemplateColsRows = (): any[] => [isAny]
  /** Grid 列/行起止 */
  const scaleGridColRowStartAndEnd = (): any[] => ['auto', { span: ['full', isInteger, isArbitraryValue] }, isArbitraryValue]
  /** Grid 列/行起始或结束 */
  const scaleGridColRowStartOrEnd = (): any[] => ['auto', isNumber, isArbitraryValue]
  /** Grid 自动列/行 */
  const scaleGridAutoColsRows = (): any[] => ['auto', 'min', 'max', 'fr', isArbitraryValue]
  /** 主轴对齐 */
  const scaleAlignPrimaryAxis = (): any[] => ['start', 'end', 'center', 'between', 'around', 'evenly', 'stretch']
  /** 交叉轴对齐 */
  const scaleAlignSecondaryAxis = (): any[] => ['start', 'end', 'center', 'stretch']
  /** 尺寸值 */
  const scaleSizing = (): any[] => ['auto', 'full', 'screen', 'min', 'max', 'fit', isArbitraryValue, themeSpacing, isLength]
  /** 颜色值 */
  const scaleColor = (): any[] => [themeColors, isArbitraryValue]
  /** 圆角值 */
  const scaleRadius = (): any[] => ['', 'none', 'full', themeBorderRadius, isArbitraryValue]
  /** 边框宽度值 */
  const scaleBorderWidth = (): any[] => ['', isLength, isArbitraryLength, themeBorderWidth]
  /** 线条样式 */
  const scaleLineStyle = (): any[] => ['solid', 'dashed', 'dotted', 'double']
  /** 混合模式 */
  const scaleBlendMode = (): any[] => ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity']
  /** 位置值 */
  const scalePosition = (): any[] => ['bottom', 'center', 'left', 'left-bottom', 'left-top', 'right', 'right-bottom', 'right-top', 'top']

  return {
    cacheSize: 500,
    separator: ':',
    theme: {
      colors: [isAny],
      spacing: [isLength, isArbitraryLength],
      blur: [isTshirtSize],
      borderRadius: ['none', '', 'full', isTshirtSize, isArbitraryValue],
      borderWidth: ['', isLength, isArbitraryLength],
      gap: [isArbitraryValue, themeSpacing],
      inset: ['auto', isArbitraryValue, themeSpacing],
      margin: ['auto', isArbitraryValue, themeSpacing],
      opacity: [isNumber, isArbitraryNumber],
      padding: [isArbitraryValue, themeSpacing],
      scale: [isNumber, isArbitraryValue],
      translate: [isArbitraryValue, themeSpacing],
      space: [isArbitraryValue, themeSpacing],
    },
    classGroups: {
      // --------------
      // --- 布局 ---
      // --------------
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      'box': [{ box: ['border', 'content'] }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      'display': ['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'table', 'inline-table', 'table-caption', 'table-cell', 'table-column', 'table-column-group', 'table-footer-group', 'table-header-group', 'table-row-group', 'table-row', 'flow-root', 'grid', 'inline-grid', 'contents', 'list-item', 'hidden'],
      /**
       * Float
       * @see https://tailwindcss.com/docs/float
       */
      'float': [{ float: ['right', 'left', 'none', 'start', 'end'] }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      'clear': [{ clear: ['left', 'right', 'both', 'none', 'start', 'end'] }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      'isolation': ['isolate', 'isolation-auto'],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      'object-fit': [{ object: ['contain', 'cover', 'fill', 'none', 'scale-down'] }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      'object-position': [{ object: [...scalePosition(), isArbitraryValue] }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      'overflow': [{ overflow: scaleOverflow() }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      'overflow-x': [{ 'overflow-x': scaleOverflow() }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      'overflow-y': [{ 'overflow-y': scaleOverflow() }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      'position': ['static', 'fixed', 'absolute', 'relative', 'sticky'],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      'visibility': ['visible', 'invisible', 'collapse'],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      'z': [{ z: ['auto', isInteger, isArbitraryValue] }],

      // ----------------
      // --- 定位 ---
      // ----------------
      /**
       * Inset
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'inset': [{ inset: [themeInset] }],
      /**
       * Inset X
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'inset-x': [{ 'inset-x': [themeInset] }],
      /**
       * Inset Y
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'inset-y': [{ 'inset-y': [themeInset] }],
      /**
       * Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'start': [{ start: [themeInset] }],
      /**
       * End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'end': [{ end: [themeInset] }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'top': [{ top: [themeInset] }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'right': [{ right: [themeInset] }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'bottom': [{ bottom: [themeInset] }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'left': [{ left: [themeInset] }],

      // --------------------------
      // --- Flexbox 和 Grid ---
      // --------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      'basis': [{ basis: ['auto', isArbitraryValue, themeSpacing] }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      'flex-direction': [{ flex: ['row', 'row-reverse', 'col', 'col-reverse'] }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      'flex-wrap': [{ flex: ['wrap', 'wrap-reverse', 'nowrap'] }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      'flex': [{ flex: ['1', 'auto', 'initial', 'none', isArbitraryValue] }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      'grow': [{ grow: ['', '0', isArbitraryValue] }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      'shrink': [{ shrink: ['', '0', isArbitraryValue] }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      'order': [{ order: ['first', 'last', 'none', isInteger, isArbitraryValue] }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      'grid-cols': [{ 'grid-cols': scaleGridTemplateColsRows() }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-start-end': [{ col: scaleGridColRowStartAndEnd() }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-start': [{ 'col-start': scaleGridColRowStartOrEnd() }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-end': [{ 'col-end': scaleGridColRowStartOrEnd() }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      'grid-rows': [{ 'grid-rows': scaleGridTemplateColsRows() }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-start-end': [{ row: scaleGridColRowStartAndEnd() }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-start': [{ 'row-start': scaleGridColRowStartOrEnd() }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-end': [{ 'row-end': scaleGridColRowStartOrEnd() }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      'grid-flow': [{ 'grid-flow': ['row', 'col', 'dense', 'row-dense', 'col-dense'] }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      'auto-cols': [{ 'auto-cols': scaleGridAutoColsRows() }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      'auto-rows': [{ 'auto-rows': scaleGridAutoColsRows() }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      'gap': [{ gap: [themeGap] }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      'gap-x': [{ 'gap-x': [themeGap] }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      'gap-y': [{ 'gap-y': [themeGap] }],

      // ----------------
      // --- 对齐 ---
      // ----------------
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      'justify-content': [{ justify: ['normal', ...scaleAlignPrimaryAxis()] }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      'justify-items': [{ 'justify-items': [...scaleAlignSecondaryAxis(), 'normal'] }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      'justify-self': [{ 'justify-self': ['auto', ...scaleAlignSecondaryAxis()] }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      'align-content': [{ content: ['normal', ...scaleAlignPrimaryAxis(), 'baseline'] }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      'align-items': [{ items: [...scaleAlignSecondaryAxis(), 'baseline'] }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      'align-self': [{ self: ['auto', ...scaleAlignSecondaryAxis(), 'baseline'] }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      'place-content': [{ 'place-content': [...scaleAlignPrimaryAxis(), 'baseline'] }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      'place-items': [{ 'place-items': [...scaleAlignSecondaryAxis(), 'baseline'] }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      'place-self': [{ 'place-self': ['auto', ...scaleAlignSecondaryAxis()] }],

      // ----------------
      // --- 间距 ---
      // ----------------
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      'p': [{ p: [themePadding] }],
      /**
       * Padding X
       * @see https://tailwindcss.com/docs/padding
       */
      'px': [{ px: [themePadding] }],
      /**
       * Padding Y
       * @see https://tailwindcss.com/docs/padding
       */
      'py': [{ py: [themePadding] }],
      /**
       * Padding Inline Start
       * @see https://tailwindcss.com/docs/padding
       */
      'ps': [{ ps: [themePadding] }],
      /**
       * Padding Inline End
       * @see https://tailwindcss.com/docs/padding
       */
      'pe': [{ pe: [themePadding] }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      'pt': [{ pt: [themePadding] }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      'pr': [{ pr: [themePadding] }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      'pb': [{ pb: [themePadding] }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      'pl': [{ pl: [themePadding] }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      'm': [{ m: [themeMargin] }],
      /**
       * Margin X
       * @see https://tailwindcss.com/docs/margin
       */
      'mx': [{ mx: [themeMargin] }],
      /**
       * Margin Y
       * @see https://tailwindcss.com/docs/margin
       */
      'my': [{ my: [themeMargin] }],
      /**
       * Margin Inline Start
       * @see https://tailwindcss.com/docs/margin
       */
      'ms': [{ ms: [themeMargin] }],
      /**
       * Margin Inline End
       * @see https://tailwindcss.com/docs/margin
       */
      'me': [{ me: [themeMargin] }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      'mt': [{ mt: [themeMargin] }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      'mr': [{ mr: [themeMargin] }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      'mb': [{ mb: [themeMargin] }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      'ml': [{ ml: [themeMargin] }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/space
       */
      'space-x': [{ 'space-x': [themeSpace] }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/space
       */
      'space-x-reverse': ['space-x-reverse'],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/space
       */
      'space-y': [{ 'space-y': [themeSpace] }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/space
       */
      'space-y-reverse': ['space-y-reverse'],

      // ----------------
      // --- 尺寸 ---
      // ----------------
      /**
       * Size
       * @see https://tailwindcss.com/docs/width
       */
      'size': [{ size: scaleSizing() }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      'w': [{ w: ['screen', ...scaleSizing()] }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      'min-w': [{ 'min-w': ['screen', 'none', ...scaleSizing()] }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      'max-w': [{ 'max-w': ['screen', 'none', 'prose', isTshirtSize, ...scaleSizing()] }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      'h': [{ h: ['screen', ...scaleSizing()] }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      'min-h': [{ 'min-h': ['screen', 'none', ...scaleSizing()] }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      'max-h': [{ 'max-h': ['screen', ...scaleSizing()] }],

      // ------------------
      // --- 排版 ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      'font-size': [{ text: ['base', isTshirtSize, isArbitraryLength] }],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      'font-style': ['italic', 'not-italic'],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      'font-weight': [{ font: ['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black', isArbitraryNumber] }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      'font-family': [{ font: [isAny] }],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      'tracking': [{ tracking: ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest', isArbitraryValue] }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      'leading': [{ leading: ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose', isLength, isArbitraryValue] }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      'text-alignment': [{ text: ['left', 'center', 'right', 'justify', 'start', 'end'] }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      'text-color': [{ text: scaleColor() }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      'text-decoration': ['underline', 'overline', 'line-through', 'no-underline'],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      'text-decoration-color': [{ decoration: scaleColor() }],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      'text-decoration-style': [{ decoration: [...scaleLineStyle(), 'wavy'] }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      'text-decoration-thickness': [{ decoration: [isLength, 'from-font', 'auto', isArbitraryLength] }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      'text-transform': ['uppercase', 'lowercase', 'capitalize', 'normal-case'],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      'text-overflow': ['truncate', 'text-ellipsis', 'text-clip'],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      'text-wrap': [{ text: ['wrap', 'nowrap', 'balance', 'pretty'] }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      'indent': [{ indent: [themeSpacing, isArbitraryValue] }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      'whitespace': [{ whitespace: ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'break-spaces'] }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      'break': [{ break: ['normal', 'words', 'all', 'keep'] }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      'hyphens': [{ hyphens: ['none', 'manual', 'auto'] }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      'content': [{ content: ['none', isArbitraryValue] }],

      // -------------------
      // --- 背景 ---
      // -------------------
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      'bg-attachment': [{ bg: ['fixed', 'local', 'scroll'] }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      'bg-clip': [{ 'bg-clip': ['border', 'padding', 'content', 'text'] }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      'bg-origin': [{ 'bg-origin': ['border', 'padding', 'content'] }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      'bg-position': [{ bg: [...scalePosition(), isArbitraryPosition] }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      'bg-repeat': [{ bg: ['no-repeat', { repeat: ['', 'x', 'y', 'round', 'space'] }] }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      'bg-size': [{ bg: ['auto', 'cover', 'contain', isArbitrarySize] }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      'bg-image': [{ bg: ['none', { 'gradient-to': ['t', 'tr', 'r', 'br', 'b', 'bl', 'l', 'tl'] }, isArbitraryValue] }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      'bg-color': [{ bg: scaleColor() }],

      // ---------------
      // --- 边框 ---
      // ---------------
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded': [{ rounded: scaleRadius() }],
      'rounded-s': [{ 'rounded-s': scaleRadius() }],
      'rounded-e': [{ 'rounded-e': scaleRadius() }],
      'rounded-t': [{ 'rounded-t': scaleRadius() }],
      'rounded-r': [{ 'rounded-r': scaleRadius() }],
      'rounded-b': [{ 'rounded-b': scaleRadius() }],
      'rounded-l': [{ 'rounded-l': scaleRadius() }],
      'rounded-ss': [{ 'rounded-ss': scaleRadius() }],
      'rounded-se': [{ 'rounded-se': scaleRadius() }],
      'rounded-ee': [{ 'rounded-ee': scaleRadius() }],
      'rounded-es': [{ 'rounded-es': scaleRadius() }],
      'rounded-tl': [{ 'rounded-tl': scaleRadius() }],
      'rounded-tr': [{ 'rounded-tr': scaleRadius() }],
      'rounded-br': [{ 'rounded-br': scaleRadius() }],
      'rounded-bl': [{ 'rounded-bl': scaleRadius() }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w': [{ border: scaleBorderWidth() }],
      'border-w-x': [{ 'border-x': scaleBorderWidth() }],
      'border-w-y': [{ 'border-y': scaleBorderWidth() }],
      'border-w-s': [{ 'border-s': scaleBorderWidth() }],
      'border-w-e': [{ 'border-e': scaleBorderWidth() }],
      'border-w-t': [{ 'border-t': scaleBorderWidth() }],
      'border-w-r': [{ 'border-r': scaleBorderWidth() }],
      'border-w-b': [{ 'border-b': scaleBorderWidth() }],
      'border-w-l': [{ 'border-l': scaleBorderWidth() }],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      'border-style': [{ border: [...scaleLineStyle(), 'hidden', 'none'] }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color': [{ border: scaleColor() }],
      'border-color-x': [{ 'border-x': scaleColor() }],
      'border-color-y': [{ 'border-y': scaleColor() }],
      'border-color-s': [{ 'border-s': scaleColor() }],
      'border-color-e': [{ 'border-e': scaleColor() }],
      'border-color-t': [{ 'border-t': scaleColor() }],
      'border-color-r': [{ 'border-r': scaleColor() }],
      'border-color-b': [{ 'border-b': scaleColor() }],
      'border-color-l': [{ 'border-l': scaleColor() }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      'outline-style': [{ outline: [...scaleLineStyle(), 'none', 'hidden'] }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      'outline-w': [{ outline: [isLength, isArbitraryLength] }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      'outline-color': [{ outline: scaleColor() }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      'outline-offset': [{ 'outline-offset': [isLength, isArbitraryValue] }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/ring-width
       */
      'ring-w': [{ ring: scaleBorderWidth() }],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/ring-color
       */
      'ring-color': [{ ring: scaleColor() }],
      /**
       * Ring Offset Width
       * @see https://tailwindcss.com/docs/ring-offset-width
       */
      'ring-offset-w': [{ 'ring-offset': [isLength, isArbitraryLength] }],
      /**
       * Ring Offset Color
       * @see https://tailwindcss.com/docs/ring-offset-color
       */
      'ring-offset-color': [{ 'ring-offset': scaleColor() }],

      // ---------------
      // --- 效果 ---
      // ---------------
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      'opacity': [{ opacity: [themeOpacity] }],
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      'shadow': [{ shadow: ['', 'inner', 'none', isTshirtSize, isArbitraryValue] }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow-color
       */
      'shadow-color': [{ shadow: scaleColor() }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      'mix-blend': [{ 'mix-blend': [...scaleBlendMode(), 'plus-lighter'] }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      'bg-blend': [{ 'bg-blend': scaleBlendMode() }],

      // ------------------
      // --- 变换 ---
      // ------------------
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      'scale': [{ scale: [themeScale] }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-x': [{ 'scale-x': [themeScale] }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-y': [{ 'scale-y': [themeScale] }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      'rotate': [{ rotate: [isInteger, isArbitraryValue] }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-x': [{ 'translate-x': [themeTranslate] }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-y': [{ 'translate-y': [themeTranslate] }],

      // ---------------------------------
      // --- 过渡和动画 ---
      // ---------------------------------
      /**
       * Transition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      'transition': [{ transition: ['', 'all', 'colors', 'opacity', 'shadow', 'transform', 'none', isArbitraryValue] }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      'duration': [{ duration: [isNumber, isArbitraryValue] }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      'ease': [{ ease: ['linear', 'in', 'out', 'in-out', isArbitraryValue] }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      'delay': [{ delay: [isNumber, isArbitraryValue] }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      'animate': [{ animate: ['none', 'spin', 'ping', 'pulse', 'bounce', isArbitraryValue] }],

      // ---------------------
      // --- 交互 ---
      // ---------------------
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      'cursor': [{ cursor: ['auto', 'default', 'pointer', 'wait', 'text', 'move', 'help', 'not-allowed', 'none', 'context-menu', 'progress', 'cell', 'crosshair', 'vertical-text', 'alias', 'copy', 'no-drop', 'grab', 'grabbing', 'all-scroll', 'col-resize', 'row-resize', 'n-resize', 'e-resize', 's-resize', 'w-resize', 'ne-resize', 'nw-resize', 'se-resize', 'sw-resize', 'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize', 'zoom-in', 'zoom-out', isArbitraryValue] }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      'pointer-events': [{ 'pointer-events': ['auto', 'none'] }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      'resize': [{ resize: ['none', '', 'y', 'x'] }],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      'select': [{ select: ['none', 'text', 'all', 'auto'] }],
    },
    conflictingClassGroups: {
      'overflow': ['overflow-x', 'overflow-y'],
      'inset': ['inset-x', 'inset-y', 'start', 'end', 'top', 'right', 'bottom', 'left'],
      'inset-x': ['right', 'left'],
      'inset-y': ['top', 'bottom'],
      'flex': ['basis', 'grow', 'shrink'],
      'gap': ['gap-x', 'gap-y'],
      'p': ['px', 'py', 'ps', 'pe', 'pt', 'pr', 'pb', 'pl'],
      'px': ['pr', 'pl'],
      'py': ['pt', 'pb'],
      'm': ['mx', 'my', 'ms', 'me', 'mt', 'mr', 'mb', 'ml'],
      'mx': ['mr', 'ml'],
      'my': ['mt', 'mb'],
      'size': ['w', 'h'],
      'font-size': ['leading'],
      'rounded': ['rounded-s', 'rounded-e', 'rounded-t', 'rounded-r', 'rounded-b', 'rounded-l', 'rounded-ss', 'rounded-se', 'rounded-ee', 'rounded-es', 'rounded-tl', 'rounded-tr', 'rounded-br', 'rounded-bl'],
      'rounded-s': ['rounded-ss', 'rounded-es'],
      'rounded-e': ['rounded-se', 'rounded-ee'],
      'rounded-t': ['rounded-tl', 'rounded-tr'],
      'rounded-r': ['rounded-tr', 'rounded-br'],
      'rounded-b': ['rounded-br', 'rounded-bl'],
      'rounded-l': ['rounded-tl', 'rounded-bl'],
      'border-w': ['border-w-s', 'border-w-e', 'border-w-t', 'border-w-r', 'border-w-b', 'border-w-l'],
      'border-w-x': ['border-w-r', 'border-w-l'],
      'border-w-y': ['border-w-t', 'border-w-b'],
      'border-color': ['border-color-s', 'border-color-e', 'border-color-t', 'border-color-r', 'border-color-b', 'border-color-l'],
      'border-color-x': ['border-color-r', 'border-color-l'],
      'border-color-y': ['border-color-t', 'border-color-b'],
    },
    conflictingClassGroupModifiers: {
      'font-size': ['leading'],
    },
  }
}
