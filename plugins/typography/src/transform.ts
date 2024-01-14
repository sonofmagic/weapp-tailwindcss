import { Parser } from 'htmlparser2'
import MagicString from 'magic-string'

export default (html: string, options?: Partial<{ prefix: string }>) => {
  const { prefix = '' } = options ?? {}
  const s = new MagicString(html)
  let tagName: string | undefined
  let hasClassAttr = false
  const stack: number[] = []
  const parser = new Parser({
    onopentag(name, attribs) {
      tagName = name
      hasClassAttr = 'class' in attribs
      stack.push(parser.endIndex)
    },
    onattribute(name) {
      if (name === 'class' && tagName) {
        // class=" length = 7
        s.appendLeft(parser.startIndex + 7, prefix + tagName + ' ')
      }
    },
    onclosetag(name) {
      const p = stack.pop()
      if (!hasClassAttr && typeof p === 'number') {
        s.appendRight(p, ` class="${prefix + name}"`)
      }
      tagName = undefined
    }
  })

  parser.write(s.original)
  parser.end()
  return s.toString()
}
