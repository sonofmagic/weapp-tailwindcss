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
// https://www.rapidtables.com/code/text/ascii-table.html
// ID选择器和类选择器对大小写敏感
// 标签选择器、属性选择器不区分大小写
// 同样一条 decl 你可以写 px 也可以写 PX
// 0-31 48-57(0-9数字字符) 65-90(大写英文) 97-122(小写英文) 127(DEL)不考虑
// #region 32-47 count:16
// 32	20	space // 其实可以忽略空格
// 33	21	! ✔
// 34	22	" ✔
// 35	23	# ✔
// 36	24	$ ✔
// 37	25	% ✔
// 38	26	& ✔
// 39	27	' ✔
// 40	28	( ✔
// 41	29	) ✔
// 42	2A	* ✔
// 43	2B	+ ✔
// 44	2C	, ✔
// 45	2D	- //小程序中允许，但是不能单独放在前后第一位-
// 46	2E	. ✔
// 47	2F	/ ✔
// #endregion
// #region 58-64 count:7 ✔
// 58	3A	: ✔
// 59	3B	; ✔
// 60	3C	< ✔
// 61	3D	= ✔
// 62	3E	> ✔
// 63	3F	? ✔
// 64	40	@ ✔
// #endregion
// #region 91-96 count:6 ✔
// 91	5B	[ ✔
// 92	5C	\ ✔
// 93	5D	] ✔
// 94	5E	^ ✔
// 95	5F	_ // 小程序中合法
// 96	60	` ✔
// #endregion
// #region 123-126 count:4 ✔
// 123	7B	{ ✔
// 124	7C	| ✔
// 125	7D	} ✔
// 126	7E	~ ✔
// #endregion
// 15 + 7 + 6 + 4 = 32
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
