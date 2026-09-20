import type { MiniProgram } from '@weapp-vite/miniprogram-automator'

export async function assertTemplatePageRendered(miniProgram: Pick<MiniProgram, 'reLaunch'>, pageUrl: string) {
  const page = await miniProgram.reLaunch(pageUrl)
  if (!page) {
    throw new Error(`模板未进入页面：${pageUrl}`)
  }
  const selector = '.min-h-screen'
  const componentSelectors = ['comp']
  // 所有模板入口均声明该根 class；类选择器也适用于 IDE 的 App-Service 查询协议。
  await page.waitForRendered({ selector, componentSelectors, timeout: 15_000 })
  const nodes = await page.renderedNodes(selector, { componentSelectors, timeout: 5000 })
  if (!Array.isArray(nodes) || !nodes.some(node => Number.isFinite(node.width) && Number.isFinite(node.height) && node.width! > 0 && node.height! > 0)) {
    throw new Error(`模板页面未产生渲染内容：${pageUrl}`)
  }
  return nodes
}
