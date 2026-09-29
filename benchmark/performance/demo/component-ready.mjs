// 此函数在页面上下文中执行，不能引用 Node 模块或外层变量。
export async function waitForTaroComponents(timeout = 1000) {
  const elements = [...document.querySelectorAll('*')].filter(element => element.localName.startsWith('taro-'))
  if (elements.some(element => typeof element.componentOnReady !== 'function')) throw new Error('Taro 自定义元素尚未注册')
  let timer
  try {
    // 网络空闲与 document.complete 不代表 Stencil 已渲染并挂载组件样式。
    await Promise.race([
      Promise.all(elements.map(element => element.componentOnReady())),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Taro 组件尚未完成首轮渲染')), timeout) }),
    ])
  }
  finally { clearTimeout(timer) }
}
