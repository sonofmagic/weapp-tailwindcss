export interface VueQuery {
  vue?: boolean
  src?: string
  type?: 'script' | 'template' | 'style' | 'custom'
  index?: number
  lang?: string
  raw?: boolean
  url?: boolean
  scoped?: boolean
  id?: string
}

export function parseVueRequest(id: string): {
  filename: string
  query: VueQuery
} {
  const [filename, rawQuery] = id.split(`?`, 2)
  const searchParams = new URLSearchParams(rawQuery)
  const query = Object.fromEntries(searchParams) as VueQuery & Record<string, string>
  if (query.vue != null) {
    query.vue = true
  }
  if (query.index != null) {
    query.index = Number(query.index)
  }
  if (query.raw != null) {
    query.raw = true
  }
  if (query.url != null) {
    query.url = true
  }
  if (query.scoped != null) {
    query.scoped = true
  }

  const langTypeMatch = [...searchParams.keys()].find(key => key.startsWith('lang.'))
  const langType = query.lang || (langTypeMatch ? langTypeMatch.slice('lang.'.length) : undefined)
  if (langType) {
    query.lang = langType
  }
  return {
    filename,
    query,
  }
}
