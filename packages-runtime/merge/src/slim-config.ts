import type { Config } from 'tailwind-merge'
import { fromTheme, validators } from 'tailwind-merge'

const {
  isAny,
  isAnyNonArbitrary,
  isArbitraryLength,
  isArbitraryPosition,
  isArbitrarySize,
  isArbitraryValue,
  isArbitraryVariable,
  isArbitraryVariableLength,
  isArbitraryVariablePosition,
  isArbitraryVariableSize,
  isFraction,
  isInteger,
  isNumber,
  isTshirtSize,
} = validators

/**
 * 精简版 tailwind-merge 配置，仅包含小程序场景中高频使用的 Tailwind 类冲突分组。
 *
 * 包含类别：布局、Flexbox、Grid、对齐、间距、尺寸、排版、背景、边框、效果、变换、过渡、交互、定位
 * 排除类别：SVG、表格、滚动捕捉、触摸操作、遮罩、透视、容器查询、列、分页、装饰断行、
 *           滚动行为覆盖、屏幕阅读器、宽高比、容器、强制颜色调整、will-change、行截断、
 *           字体变体数字、渐变、滤镜/背景滤镜、强调色、光标颜色、外观
 */
export function getSlimConfig(): Config<string, string> {
  const themeColor = fromTheme('color')
  const themeFont = fromTheme('font')
  const themeText = fromTheme('text')
  const themeFontWeight = fromTheme('font-weight')
  const themeTracking = fromTheme('tracking')
  const themeLeading = fromTheme('leading')
  const themeSpacing = fromTheme('spacing')
  const themeRadius = fromTheme('radius')
  const themeShadow = fromTheme('shadow')
  const themeEase = fromTheme('ease')
  const themeAnimate = fromTheme('animate')
  const themeBreakpoint = fromTheme('breakpoint')
  const themeContainer = fromTheme('container')

  /** 无歧义间距值 */
  const scaleUnambiguousSpacing = (): any[] => [isArbitraryVariable, isArbitraryValue, themeSpacing]
  /** 定位值 */
  const scaleInset = (): any[] => [isFraction, 'full', 'auto', ...scaleUnambiguousSpacing()]
  /** 溢出值 */
  const scaleOverflow = (): any[] => ['auto', 'hidden', 'clip', 'visible', 'scroll']
  /** Grid 模板列/行 */
  const scaleGridTemplateColsRows = (): any[] => [isInteger, 'none', 'subgrid', isArbitraryVariable, isArbitraryValue]
  /** Grid 列/行起止 */
  const scaleGridColRowStartAndEnd = (): any[] => ['auto', { span: ['full', isInteger, isArbitraryVariable, isArbitraryValue] }, isInteger, isArbitraryVariable, isArbitraryValue]
  /** Grid 列/行起始或结束 */
  const scaleGridColRowStartOrEnd = (): any[] => [isInteger, 'auto', isArbitraryVariable, isArbitraryValue]
  /** Grid 自动列/行 */
  const scaleGridAutoColsRows = (): any[] => ['auto', 'min', 'max', 'fr', isArbitraryVariable, isArbitraryValue]
  /** 主轴对齐 */
  const scaleAlignPrimaryAxis = (): any[] => ['start', 'end', 'center', 'between', 'around', 'evenly', 'stretch', 'baseline', 'center-safe', 'end-safe']
  /** 交叉轴对齐 */
  const scaleAlignSecondaryAxis = (): any[] => ['start', 'end', 'center', 'stretch', 'center-safe', 'end-safe']
  /** 外边距值 */
  const scaleMargin = (): any[] => ['auto', ...scaleUnambiguousSpacing()]
  /** 尺寸值 */
  const scaleSizing = (): any[] => [isFraction, 'auto', 'full', 'dvw', 'dvh', 'lvw', 'lvh', 'svw', 'svh', 'min', 'max', 'fit', ...scaleUnambiguousSpacing()]
  /** 颜色值 */
  const scaleColor = (): any[] => [themeColor, isArbitraryVariable, isArbitraryValue]
  /** 圆角值 */
  const scaleRadius = (): any[] => ['', 'none', 'full', themeRadius, isArbitraryVariable, isArbitraryValue]
  /** 边框宽度值 */
  const scaleBorderWidth = (): any[] => ['', isNumber, isArbitraryVariableLength, isArbitraryLength]
  /** 线条样式 */
  const scaleLineStyle = (): any[] => ['solid', 'dashed', 'dotted', 'double']
  /** 混合模式 */
  const scaleBlendMode = (): any[] => ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity']
  /** 位置值 */
  const scalePosition = (): any[] => ['center', 'top', 'bottom', 'left', 'right', 'top-left', 'left-top', 'top-right', 'right-top', 'bottom-right', 'right-bottom', 'bottom-left', 'left-bottom']
  /** 位置值（含 arbitrary） */
  const scalePositionWithArbitrary = (): any[] => [...scalePosition(), isArbitraryVariable, isArbitraryValue]
  /** 背景位置值 */
  const scaleBgPosition = (): any[] => [...scalePosition(), isArbitraryVariablePosition, isArbitraryPosition, { position: [isArbitraryVariable, isArbitraryValue] }]
  /** 背景重复值 */
  const scaleBgRepeat = (): any[] => ['no-repeat', { repeat: ['', 'x', 'y', 'space', 'round'] }]
  /** 背景尺寸值 */
  const scaleBgSize = (): any[] => ['auto', 'cover', 'contain', isArbitraryVariableSize, isArbitrarySize, { size: [isArbitraryVariable, isArbitraryValue] }]
  /** 旋转值 */
  const scaleRotate = (): any[] => ['none', isNumber, isArbitraryVariable, isArbitraryValue]
  /** 缩放值 */
  const scaleScale = (): any[] => ['none', isNumber, isArbitraryVariable, isArbitraryValue]
  /** 平移值 */
  const scaleTranslate = (): any[] => [isFraction, 'full', ...scaleUnambiguousSpacing()]

  return {
    cacheSize: 500,
    theme: {
      'animate': ['spin', 'ping', 'pulse', 'bounce'],
      'blur': [isTshirtSize],
      'breakpoint': [isTshirtSize],
      'color': [isAny],
      'container': [isTshirtSize],
      'drop-shadow': [isTshirtSize],
      'ease': ['in', 'out', 'in-out'],
      'font': [isAnyNonArbitrary],
      'font-weight': ['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'],
      'inset-shadow': [isTshirtSize],
      'leading': ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'],
      'radius': [isTshirtSize],
      'shadow': [isTshirtSize],
      'spacing': ['px', isNumber],
      'text': [isTshirtSize],
      'text-shadow': [isTshirtSize],
      'tracking': ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'],
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
      'object-position': [{ object: scalePositionWithArbitrary() }],
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
      'z': [{ z: [isInteger, 'auto', isArbitraryVariable, isArbitraryValue] }],

      // ----------------
      // --- 定位 ---
      // ----------------
      /**
       * Inset
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'inset': [{ inset: scaleInset() }],
      /**
       * Inset X
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'inset-x': [{ 'inset-x': scaleInset() }],
      /**
       * Inset Y
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'inset-y': [{ 'inset-y': scaleInset() }],
      /**
       * Inset Inline Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'start': [{ 'inset-s': scaleInset(), 'start': scaleInset() }],
      /**
       * Inset Inline End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'end': [{ 'inset-e': scaleInset(), 'end': scaleInset() }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'top': [{ top: scaleInset() }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'right': [{ right: scaleInset() }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'bottom': [{ bottom: scaleInset() }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'left': [{ left: scaleInset() }],

      // --------------------------
      // --- Flexbox 和 Grid ---
      // --------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      'basis': [{ basis: [isFraction, 'full', 'auto', themeContainer, ...scaleUnambiguousSpacing()] }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      'flex-direction': [{ flex: ['row', 'row-reverse', 'col', 'col-reverse'] }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      'flex-wrap': [{ flex: ['nowrap', 'wrap', 'wrap-reverse'] }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      'flex': [{ flex: [isNumber, isFraction, 'auto', 'initial', 'none', isArbitraryValue] }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      'grow': [{ grow: ['', isNumber, isArbitraryVariable, isArbitraryValue] }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      'shrink': [{ shrink: ['', isNumber, isArbitraryVariable, isArbitraryValue] }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      'order': [{ order: [isInteger, 'first', 'last', 'none', isArbitraryVariable, isArbitraryValue] }],
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
      'gap': [{ gap: scaleUnambiguousSpacing() }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      'gap-x': [{ 'gap-x': scaleUnambiguousSpacing() }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      'gap-y': [{ 'gap-y': scaleUnambiguousSpacing() }],

      // ----------------
      // --- 对齐 ---
      // ----------------
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      'justify-content': [{ justify: [...scaleAlignPrimaryAxis(), 'normal'] }],
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
      'align-content': [{ content: ['normal', ...scaleAlignPrimaryAxis()] }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      'align-items': [{ items: [...scaleAlignSecondaryAxis(), { baseline: ['', 'last'] }] }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      'align-self': [{ self: ['auto', ...scaleAlignSecondaryAxis(), { baseline: ['', 'last'] }] }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      'place-content': [{ 'place-content': scaleAlignPrimaryAxis() }],
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
      'p': [{ p: scaleUnambiguousSpacing() }],
      /**
       * Padding X
       * @see https://tailwindcss.com/docs/padding
       */
      'px': [{ px: scaleUnambiguousSpacing() }],
      /**
       * Padding Y
       * @see https://tailwindcss.com/docs/padding
       */
      'py': [{ py: scaleUnambiguousSpacing() }],
      /**
       * Padding Inline Start
       * @see https://tailwindcss.com/docs/padding
       */
      'ps': [{ ps: scaleUnambiguousSpacing() }],
      /**
       * Padding Inline End
       * @see https://tailwindcss.com/docs/padding
       */
      'pe': [{ pe: scaleUnambiguousSpacing() }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      'pt': [{ pt: scaleUnambiguousSpacing() }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      'pr': [{ pr: scaleUnambiguousSpacing() }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      'pb': [{ pb: scaleUnambiguousSpacing() }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      'pl': [{ pl: scaleUnambiguousSpacing() }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      'm': [{ m: scaleMargin() }],
      /**
       * Margin X
       * @see https://tailwindcss.com/docs/margin
       */
      'mx': [{ mx: scaleMargin() }],
      /**
       * Margin Y
       * @see https://tailwindcss.com/docs/margin
       */
      'my': [{ my: scaleMargin() }],
      /**
       * Margin Inline Start
       * @see https://tailwindcss.com/docs/margin
       */
      'ms': [{ ms: scaleMargin() }],
      /**
       * Margin Inline End
       * @see https://tailwindcss.com/docs/margin
       */
      'me': [{ me: scaleMargin() }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      'mt': [{ mt: scaleMargin() }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      'mr': [{ mr: scaleMargin() }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      'mb': [{ mb: scaleMargin() }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      'ml': [{ ml: scaleMargin() }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      'space-x': [{ 'space-x': scaleUnambiguousSpacing() }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      'space-x-reverse': ['space-x-reverse'],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      'space-y': [{ 'space-y': scaleUnambiguousSpacing() }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      'space-y-reverse': ['space-y-reverse'],

      // ----------------
      // --- 尺寸 ---
      // ----------------
      /**
       * Size
       * @see https://tailwindcss.com/docs/width#setting-both-width-and-height
       */
      'size': [{ size: scaleSizing() }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      'w': [{ w: [themeContainer, 'screen', ...scaleSizing()] }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      'min-w': [{ 'min-w': [themeContainer, 'screen', 'none', ...scaleSizing()] }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      'max-w': [{ 'max-w': [themeContainer, 'screen', 'none', 'prose', { screen: [themeBreakpoint] }, ...scaleSizing()] }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      'h': [{ h: ['screen', 'lh', ...scaleSizing()] }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      'min-h': [{ 'min-h': ['screen', 'lh', 'none', ...scaleSizing()] }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      'max-h': [{ 'max-h': ['screen', 'lh', ...scaleSizing()] }],

      // ------------------
      // --- 排版 ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      'font-size': [{ text: ['base', themeText, isArbitraryVariableLength, isArbitraryLength] }],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      'font-style': ['italic', 'not-italic'],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      'font-weight': [{ font: [themeFontWeight, isArbitraryVariable, isArbitraryValue] }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      'font-family': [{ font: [isArbitraryVariable, isArbitraryValue, themeFont] }],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      'tracking': [{ tracking: [themeTracking, isArbitraryVariable, isArbitraryValue] }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      'leading': [{ leading: [themeLeading, ...scaleUnambiguousSpacing()] }],
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
      'text-decoration-thickness': [{ decoration: [isNumber, 'from-font', 'auto', isArbitraryVariable, isArbitraryLength] }],
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
      'indent': [{ indent: scaleUnambiguousSpacing() }],
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
      'content': [{ content: ['none', isArbitraryVariable, isArbitraryValue] }],

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
      'bg-position': [{ bg: scaleBgPosition() }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      'bg-repeat': [{ bg: scaleBgRepeat() }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      'bg-size': [{ bg: scaleBgSize() }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      'bg-image': [{ bg: ['none', { linear: [{ to: ['t', 'tr', 'r', 'br', 'b', 'bl', 'l', 'tl'] }, isInteger, isArbitraryVariable, isArbitraryValue], radial: ['', isArbitraryVariable, isArbitraryValue], conic: [isInteger, isArbitraryVariable, isArbitraryValue] }, isArbitraryVariable, isArbitraryValue] }],
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
      'outline-w': [{ outline: ['', isNumber, isArbitraryVariableLength, isArbitraryLength] }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      'outline-color': [{ outline: scaleColor() }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      'outline-offset': [{ 'outline-offset': [isNumber, isArbitraryVariable, isArbitraryValue] }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
       */
      'ring-w': [{ ring: scaleBorderWidth() }],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
       */
      'ring-color': [{ ring: scaleColor() }],
      /**
       * Ring Offset Width
       * @deprecated since Tailwind CSS v4.0.0
       */
      'ring-offset-w': [{ 'ring-offset': [isNumber, isArbitraryLength] }],
      /**
       * Ring Offset Color
       * @deprecated since Tailwind CSS v4.0.0
       */
      'ring-offset-color': [{ 'ring-offset': scaleColor() }],

      // ---------------
      // --- 效果 ---
      // ---------------
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      'opacity': [{ opacity: [isNumber, isArbitraryVariable, isArbitraryValue] }],
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      'shadow': [{ shadow: ['', 'none', themeShadow, isArbitraryVariable, isArbitraryValue] }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
       */
      'shadow-color': [{ shadow: scaleColor() }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      'mix-blend': [{ 'mix-blend': [...scaleBlendMode(), 'plus-darker', 'plus-lighter'] }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      'bg-blend': [{ 'bg-blend': scaleBlendMode() }],

      // ------------------
      // --- 变换 ---
      // ------------------
      /**
       * Translate
       * @see https://tailwindcss.com/docs/translate
       */
      'translate': [{ translate: scaleTranslate() }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-x': [{ 'translate-x': scaleTranslate() }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-y': [{ 'translate-y': scaleTranslate() }],
      /**
       * Translate None
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-none': ['translate-none'],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      'scale': [{ scale: scaleScale() }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-x': [{ 'scale-x': scaleScale() }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-y': [{ 'scale-y': scaleScale() }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      'rotate': [{ rotate: scaleRotate() }],

      // ---------------------------------
      // --- 过渡和动画 ---
      // ---------------------------------
      /**
       * Transition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      'transition': [{ transition: ['', 'all', 'colors', 'opacity', 'shadow', 'transform', 'none', isArbitraryVariable, isArbitraryValue] }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      'duration': [{ duration: [isNumber, 'initial', isArbitraryVariable, isArbitraryValue] }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      'ease': [{ ease: ['linear', 'initial', themeEase, isArbitraryVariable, isArbitraryValue] }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      'delay': [{ delay: [isNumber, isArbitraryVariable, isArbitraryValue] }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      'animate': [{ animate: ['none', themeAnimate, isArbitraryVariable, isArbitraryValue] }],

      // ---------------------
      // --- 交互 ---
      // ---------------------
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      'cursor': [{ cursor: ['auto', 'default', 'pointer', 'wait', 'text', 'move', 'help', 'not-allowed', 'none', 'context-menu', 'progress', 'cell', 'crosshair', 'vertical-text', 'alias', 'copy', 'no-drop', 'grab', 'grabbing', 'all-scroll', 'col-resize', 'row-resize', 'n-resize', 'e-resize', 's-resize', 'w-resize', 'ne-resize', 'nw-resize', 'se-resize', 'sw-resize', 'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize', 'zoom-in', 'zoom-out', isArbitraryVariable, isArbitraryValue] }],
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
      'border-w': ['border-w-x', 'border-w-y', 'border-w-s', 'border-w-e', 'border-w-t', 'border-w-r', 'border-w-b', 'border-w-l'],
      'border-w-x': ['border-w-r', 'border-w-l'],
      'border-w-y': ['border-w-t', 'border-w-b'],
      'border-color': ['border-color-x', 'border-color-y', 'border-color-s', 'border-color-e', 'border-color-t', 'border-color-r', 'border-color-b', 'border-color-l'],
      'border-color-x': ['border-color-r', 'border-color-l'],
      'border-color-y': ['border-color-t', 'border-color-b'],
      'translate': ['translate-x', 'translate-y', 'translate-none'],
      'translate-none': ['translate', 'translate-x', 'translate-y', 'translate-z'],
    },
    conflictingClassGroupModifiers: {
      'font-size': ['leading'],
    },
    orderSensitiveModifiers: ['*', '**', 'after', 'backdrop', 'before', 'details-content', 'file', 'first-letter', 'first-line', 'marker', 'placeholder', 'selection'],
  }
}
