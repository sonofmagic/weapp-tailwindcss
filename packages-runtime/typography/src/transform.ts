import { Parser } from 'htmlparser2'
import MagicString from 'magic-string'

export default (html: string, options?: Partial<{ prefix: string }>) => {
  const { prefix = '' } = options ?? {}
  const s = new MagicString(html)
  let tagName: string | undefined

  const hasClassStack: boolean[] = []
  const stack: number[] = []
  const parser = new Parser({
    onopentagname(name) {
      tagName = name
      stack.push(parser.endIndex)
    },
    onattribute(name) {
      if (name === 'class' && tagName) {
        // class=" length = 7
        s.appendLeft(parser.startIndex + 7, `${prefix + tagName} `)
      }
    },
    onopentag(_name, attribs) {
      hasClassStack.push('class' in attribs)
    },
    onclosetag(name) {
      const p = stack.pop()
      if (!hasClassStack.pop() && typeof p === 'number') {
        s.appendRight(p, ` class="${prefix + name}"`)
      }
      tagName = undefined
    },
  })

  parser.write(s.original)
  parser.end()
  return s.toString()
}
