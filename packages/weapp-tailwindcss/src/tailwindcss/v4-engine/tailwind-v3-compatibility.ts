import { createTailwindV3DefaultColorThemeCss } from './tailwind-v3-default-colors'

const TAILWIND_V3_COMPATIBILITY_THEME_CSS = [
  '@theme {',
  '  --default-ring-width: 3px;',
  '  --default-ring-color: var(--color-blue-500, #3b82f6);',
  '  --default-outline-width: 3px;',
  '',
  '  --shadow-xs: 0 1px rgb(0 0 0 / 0.05);',
  '  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);',
  '  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);',
  '  --drop-shadow-xs: 0 1px 1px rgb(0 0 0 / 0.05);',
  '  --drop-shadow-sm: 0 1px 2px rgb(0 0 0 / 0.15);',
  '  --drop-shadow: 0 1px 2px rgb(0 0 0 / 0.1), 0 1px 1px rgb(0 0 0 / 0.06);',
  '',
  '  --blur-xs: 4px;',
  '  --blur-sm: 4px;',
  '  --blur: 8px;',
  '  --backdrop-blur-xs: 4px;',
  '  --backdrop-blur-sm: 4px;',
  '  --backdrop-blur: 8px;',
  '',
  '  --radius-xs: 0.125rem;',
  '  --radius-sm: 0.125rem;',
  '  --radius: 0.25rem;',
  '}',
  createTailwindV3DefaultColorThemeCss(),
].join('\n')

const TAILWIND_V3_COMPATIBILITY_BASE_CSS = [
  '*,',
  '::after,',
  '::before,',
  '::backdrop,',
  '::file-selector-button {',
  '  border-color: var(--color-gray-200, currentcolor);',
  '}',
  '',
  'input::placeholder,',
  'textarea::placeholder {',
  '  opacity: 1;',
  '  color: var(--color-gray-400, currentcolor);',
  '}',
  '',
  'button:not(:disabled),',
  '[role="button"]:not(:disabled) {',
  '  cursor: pointer;',
  '}',
  '',
  'dialog {',
  '  margin: auto;',
  '}',
].join('\n')

export function applyTailwindV3CompatibilityCss(css: string) {
  return `${TAILWIND_V3_COMPATIBILITY_THEME_CSS}\n${css}\n${TAILWIND_V3_COMPATIBILITY_BASE_CSS}`
}
