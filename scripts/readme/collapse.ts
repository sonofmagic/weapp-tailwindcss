export interface CollapseOptions {
  summary?: string
  body?: string
}

export function collapse(options: CollapseOptions = {}) {
  const { summary = '', body = '' } = options
  return [`<details><summary>${summary}</summary><br/>`, body, `<br/></details>`].join('\n')
}
