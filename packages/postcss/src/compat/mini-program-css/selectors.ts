import type postcss from 'postcss'

export const MINI_PROGRAM_THEME_SCOPE_SELECTOR = ':host,page,.tw-root,wx-root-portal-content'
export const MINI_PROGRAM_ELEMENT_SCOPE_SELECTOR = 'view,text,:after,:before'

export const MINI_PROGRAM_ELEMENT_SCOPE_SELECTORS = new Set([
  'view',
  'text',
  ':before',
  ':after',
  '::before',
  '::after',
])

export const MINI_PROGRAM_PREFLIGHT_SELECTORS = new Set([
  '*',
  ...MINI_PROGRAM_ELEMENT_SCOPE_SELECTORS,
])

export const MINI_PROGRAM_THEME_SCOPE_SELECTORS = new Set([
  ':host',
  ':root',
  'page',
  '.tw-root',
  'wx-root-portal-content',
])

export const SPECIFICITY_PLACEHOLDER_SUFFIXES = [':not(#n)', ':not(#\\#)']

const MINI_PROGRAM_UNSUPPORTED_BROWSER_SELECTORS = new Set([
  ':-moz-focusring',
  ':-moz-ui-invalid',
  '::-webkit-calendar-picker-indicator',
  '::-webkit-date-and-time-value',
  '::-webkit-datetime-edit',
  '::-webkit-datetime-edit-day-field',
  '::-webkit-datetime-edit-fields-wrapper',
  '::-webkit-datetime-edit-hour-field',
  '::-webkit-datetime-edit-meridiem-field',
  '::-webkit-datetime-edit-millisecond-field',
  '::-webkit-datetime-edit-minute-field',
  '::-webkit-datetime-edit-month-field',
  '::-webkit-datetime-edit-second-field',
  '::-webkit-datetime-edit-year-field',
  '::-webkit-inner-spin-button',
  '::-webkit-input-placeholder',
  '::-webkit-outer-spin-button',
  '::-webkit-search-decoration',
  '::placeholder',
  '[hidden]:where(:not([hidden=\'until-found\']))',
])

const MINI_PROGRAM_UNSUPPORTED_BROWSER_TAG_SELECTORS = new Set([
  'a',
  'abbr:where([title])',
  'audio',
  'b',
  'button',
  'canvas',
  'code',
  'embed',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'html',
  'iframe',
  'img',
  'input',
  'input:where([type=\'button\'],[type=\'reset\'],[type=\'submit\'])',
  'kbd',
  'menu',
  'object',
  'ol',
  'optgroup',
  'pre',
  'progress',
  'samp',
  'select',
  'select[multiple]optgroup',
  'select[multiple]optgroupoption',
  'select[size]optgroup',
  'select[size]optgroupoption',
  'small',
  'strong',
  'sub',
  'summary',
  'sup',
  'svg',
  'table',
  'textarea',
  'ul',
  'video',
])

export function normalizeSelector(selector: string) {
  return selector.trim().replace(/\s+/g, '')
}

export function getRuleSelectors(rule: postcss.Rule) {
  return rule.selector
    .split(',')
    .map(normalizeSelector)
    .filter(Boolean)
}

export function getSortedRuleSelectorKey(rule: postcss.Rule) {
  return getRuleSelectors(rule).sort().join(',')
}

export function isUnsupportedBrowserSelector(selector: string) {
  const normalized = normalizeSelector(selector)
  return MINI_PROGRAM_UNSUPPORTED_BROWSER_SELECTORS.has(normalized)
    || MINI_PROGRAM_UNSUPPORTED_BROWSER_TAG_SELECTORS.has(normalized)
}

export function isMiniProgramPreflightSelector(selectors: string[]) {
  return selectors.length > 0
    && selectors.every(selector => MINI_PROGRAM_PREFLIGHT_SELECTORS.has(selector))
    && selectors.some(selector => selector === '*' || selector === ':before' || selector === ':after' || selector === '::before' || selector === '::after')
}

export function isMiniProgramThemeScopeSelector(selectors: string[]) {
  return selectors.length > 0
    && selectors.every(selector => MINI_PROGRAM_THEME_SCOPE_SELECTORS.has(selector))
}
