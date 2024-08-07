// const virtualModuleId = 'virtual:weapp-vite-pages'
// const resolvedVirtualModuleId = '\0' + virtualModuleId
export interface ParseRequestResponse {
  filename: string
  query: { wxss?: true }
}

export function parseRequest(id: string): ParseRequestResponse {
  const [filename, rawQuery] = id.split(`?`, 2)
  const query = Object.fromEntries(new URLSearchParams(rawQuery)) as { wxss?: true }
  if (Reflect.has(query, 'wxss')) {
    query.wxss = true
  }
  return {
    filename,
    query,
  }
}
