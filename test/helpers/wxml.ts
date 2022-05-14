import prettier from 'prettier'

export function format (source: string) {
  return prettier.format(source, {
    parser: 'html'
  })
}
