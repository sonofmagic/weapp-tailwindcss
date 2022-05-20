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
  SPACE: '',
  DOT: '.',
  HASH: '#'
} as const

export const MappingChars2String = {
  [SYMBOL_TABLE.BRACKETLEFT]: '_l_',
  [SYMBOL_TABLE.BRACKETRIGHT]: '_r_',
  [SYMBOL_TABLE.PARENLEFT]: '_p_',
  [SYMBOL_TABLE.PARENRIGHT]: '_q_',
  [SYMBOL_TABLE.HASH]: '_h_',
  [SYMBOL_TABLE.EXCLAM]: '_i_',
  [SYMBOL_TABLE.SLASH]: '_div_',
  [SYMBOL_TABLE.DOT]: '_dot_',
  [SYMBOL_TABLE.COLON]: '_c_',
  [SYMBOL_TABLE.PERCENT]: '_pct_',
  [SYMBOL_TABLE.COMMA]: '_d_',
  [SYMBOL_TABLE.QUOTE]: '_y_'
} as const
