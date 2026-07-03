const UNI_APP_X_WEB_COMPONENT_TAGS = [
  'uni-ad-draw',
  'uni-ad-fullscreen-video',
  'uni-ad-interactive',
  'uni-ad-interstitial',
  'uni-ad-rewarded-video',
  'uni-ad',
  'uni-animation-view',
  'uni-audio',
  'uni-block',
  'uni-button',
  'uni-camera',
  'uni-canvas',
  'uni-checkbox-group',
  'uni-checkbox',
  'uni-cover-image',
  'uni-cover-view',
  'uni-custom-tab-bar',
  'uni-editor',
  'uni-form',
  'uni-icon',
  'uni-image',
  'uni-input',
  'uni-label',
  'uni-list-item',
  'uni-list-view',
  'uni-live-player',
  'uni-live-pusher',
  'uni-map',
  'uni-match-media',
  'uni-movable-area',
  'uni-movable-view',
  'uni-navigation-bar',
  'uni-navigator',
  'uni-open-data',
  'uni-page-meta',
  'uni-picker-view',
  'uni-picker',
  'uni-progress',
  'uni-radio-group',
  'uni-radio',
  'uni-rich-text',
  'uni-scroll-view',
  'uni-slider',
  'uni-sticky-header',
  'uni-sticky-section',
  'uni-swiper-item',
  'uni-swiper',
  'uni-switch',
  'uni-template',
  'uni-text',
  'uni-textarea',
  'uni-unicloud-db',
  'uni-video',
  'uni-view',
  'uni-web-view',
] as const

export const UNI_APP_X_WEB_PREFLIGHT_RESET_MARKER = 'weapp-tailwindcss uni-app-x web preflight reset'

export const UNI_APP_X_WEB_PREFLIGHT_RESET_CSS = [
  `/* ${UNI_APP_X_WEB_PREFLIGHT_RESET_MARKER} */`,
  `${UNI_APP_X_WEB_COMPONENT_TAGS.map(tag => `uni-app ${tag}`).join(', ')}{border-width:0;}`,
].join('\n')

const TAILWIND_PREFLIGHT_BORDER_RE = /\bborder\s*:\s*0(?:px)?\s+solid\b/

export function withUniAppXWebPreflightReset(css: string, enabled: boolean) {
  if (
    !enabled
    || css.includes(UNI_APP_X_WEB_PREFLIGHT_RESET_MARKER)
    || !TAILWIND_PREFLIGHT_BORDER_RE.test(css)
  ) {
    return css
  }
  return css.length > 0
    ? `${UNI_APP_X_WEB_PREFLIGHT_RESET_CSS}\n${css}`
    : UNI_APP_X_WEB_PREFLIGHT_RESET_CSS
}
