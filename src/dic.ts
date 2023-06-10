export const SYMBOL_TABLE = {
  BACKQUOTE: '`',
  TILDE: '~',
  EXCLAM: '!',
  AT: '@',
  NUMBERSIGN: '#',
  DOLLAR: '$',
  PERCENT: '%',
  CARET: '^',
  AMPERSAND: '&',
  ASTERISK: '*',
  PARENLEFT: '(',
  PARENRIGHT: ')',
  MINUS: '-',
  UNDERSCORE: '_',
  EQUAL: '=',
  PLUS: '+',
  BRACKETLEFT: '[',
  BRACELEFT: '{',
  BRACKETRIGHT: ']',
  BRACERIGHT: '}',
  SEMICOLON: ';',
  COLON: ':',
  QUOTE: "'",
  DOUBLEQUOTE: '"',
  BACKSLASH: '\\',
  BAR: '|',
  COMMA: ',',
  LESS: '<',
  PERIOD: '.',
  GREATER: '>',
  SLASH: '/',
  QUESTION: '?',
  SPACE: ' ',
  DOT: '.',
  HASH: '#'
} as const

export type SYMBOL_TABLE_TYPE = typeof SYMBOL_TABLE

export type SYMBOL_TABLE_TYPE_VALUES = SYMBOL_TABLE_TYPE[keyof SYMBOL_TABLE_TYPE]

export type MappingStringDictionary = Record<Exclude<SYMBOL_TABLE_TYPE_VALUES, '-' | '_' | ' '>, string>

/**
 * @deprecated
 */
export const MappingChars2String: MappingStringDictionary = {
  '[': '_bl_',
  ']': '_br_',
  '(': '_pl_',
  ')': '_qr_',
  '#': '_h_',
  '!': '_i_',
  '/': '_s_',
  '\\': '_bs_',
  '.': '_d_',
  ':': '_c_',
  '%': '_p_',
  ',': '_co_',
  "'": '_q_',
  '"': '_dq_',
  '*': '_a_',
  '&': '_am_',
  '@': '_at_',
  '{': '_bal_',
  '}': '_bar_',
  // ' ': '_sp_',
  '+': '_plus_',
  // '-': '_m_',
  ';': '_se_',
  '<': '_l_',
  '~': '_t_',
  '=': '_e_',
  '>': '_g_',
  '?': '_qu_',
  '^': '_ca_',
  '`': '_bq_',
  '|': '_b_',
  $: '_do_'
  // _: '_u_'
} as const
/**
 * @deprecated
 */
export const MappingChars2StringEntries = Object.entries(MappingChars2String)
// 用 _ 比 - 好
export const SimpleMappingChars2String: MappingStringDictionary = {
  '[': '_',
  ']': '_',
  '(': '_',
  ')': '_',
  '{': '_',
  '}': '_',
  '+': 'a',
  ',': 'b',
  ':': 'c',
  '.': 'd',
  '=': 'e',
  ';': 'f',
  '>': 'g',
  '#': 'h',
  '!': 'i',
  '@': 'j',
  '^': 'k',
  '<': 'l',
  '*': 'm',
  '&': 'n',
  '?': 'o',
  '%': 'p',
  "'": 'q',
  $: 'r',
  '/': 's',
  '~': 't',
  '|': 'u',
  '`': 'v',
  '\\': 'w',
  '"': 'x'
}

export const SimpleMappingChars2StringEntries = Object.entries(SimpleMappingChars2String)
