export function trackBrowserState(page) {
  const pending = new Set()
  const errors = []
  let documents = 0
  let transportReady = false
  page.on('pageerror', error => errors.push(error.message))
  page.on('response', (response) => {
    const request = response.request()
    // 只有成功的新主文档才能替换旧文档的请求集合；hash/history 不改变文档身份。
    if (request.isNavigationRequest() && request.frame() === page.mainFrame() && response.status() >= 200 && response.status() < 300) {
      documents++
      pending.clear()
      transportReady = false
    }
  })
  page.on('request', (request) => {
    if (['script', 'stylesheet'].includes(request.resourceType())) pending.add(request)
  })
  page.on('requestfinished', request => pending.delete(request))
  page.on('requestfailed', (request) => {
    pending.delete(request)
    errors.push(`${request.url()}: ${request.failure()?.errorText}`)
  })
  page.on('websocket', (socket) => {
    const version = documents
    socket.on('framereceived', ({ payload }) => {
      try {
        if (version === documents && ['connected', 'ok', 'still-ok', 'warnings'].includes(JSON.parse(String(payload)).type)) transportReady = true
      }
      catch { /* 业务 WebSocket 不参与构建工具的握手验证。 */ }
    })
  })
  return { pending, errors, documents: () => documents, transportReady: () => transportReady }
}
