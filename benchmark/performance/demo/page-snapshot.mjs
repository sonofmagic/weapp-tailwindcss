// 此函数在页面上下文中执行；marker、组件就绪和计算样式必须属于同一次采样。
export async function readPageSnapshot({ expected, round, marker, family }) {
  const first = document.getElementById('tw-matrix-height')
  if (!first?.textContent.includes(marker)) throw new Error('本轮页面 marker 尚未生效')
  // 必须先看到本轮节点，再等待组件；分两次 evaluate 会把空文档的就绪状态用于随后出现的节点。
  if (family === 'taro') await globalThis.__WEAPP_DEMO_COST_COMPONENT_READY__()
  if (!first.isConnected || !first.textContent.includes(marker)) throw new Error('等待组件时页面状态发生变化')
  const computed = {}
  for (const [key, name] of Object.entries(expected)) {
    const element = document.getElementById(`tw-matrix-${key}`)
    if (!element || element.dataset.twMatrix !== round) throw new Error(`本轮节点缺失：${key}`)
    const css = getComputedStyle(element)
    computed[key] = { name, classes: [...element.classList], width: css.width, height: css.height, marginTop: css.marginTop, display: css.display, color: css.color, background: css.backgroundColor }
  }
  if (round === 'restore' && document.getElementById('tw-matrix-added')) throw new Error('移除节点仍存在')
  const styles = []
  for (const sheet of document.styleSheets) {
    // Web demo 的 weapp 转换预览含 rpx；CSSOM 会丢弃该声明，原始已挂载样式才保留转换证据。
    // 页面效果仍由下方计算样式单独核验，不能用原始文本冒充浏览器支持小程序单位。
    try { styles.push(sheet.ownerNode?.tagName === 'STYLE' ? sheet.ownerNode.textContent : [...sheet.cssRules].map(rule => rule.cssText).join('\n')) }
    catch { /* 不读取跨域第三方样式。 */ }
  }
  const topology = [...document.body.querySelectorAll('*')].filter(element => !['SCRIPT', 'STYLE'].includes(element.tagName)).map(element => {
    const css = getComputedStyle(element)
    return { tag: element.tagName, children: element.children.length, height: css.height, width: css.width, color: css.color, background: css.backgroundColor, display: css.display }
  })
  return { computed, styles, topology, ready: document.readyState, hot: globalThis.__WEAPP_TW_MATRIX_HMR_STATUS__?.() }
}
