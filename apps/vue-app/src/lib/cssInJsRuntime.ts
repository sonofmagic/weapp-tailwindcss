const styleCache = new Map<string, HTMLStyleElement>()

/**
 * Minimal CSS-in-JS runtime for the demo: write CSS text into a dedicated
 * <style> element keyed by id. When the CSS changes we update the node instead
 * of re-creating it, so toggling主题时不会重复插入标签。
 */
export function injectCss(id: string, css: string) {
  if (typeof document === 'undefined') {
    return
  }
  let styleEl = styleCache.get(id)
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.dataset.source = id
    styleEl.dataset.scope = 'css-in-js-demo'
    document.head.appendChild(styleEl)
    styleCache.set(id, styleEl)
  }
  if (styleEl.textContent !== css) {
    styleEl.textContent = css
  }
}
