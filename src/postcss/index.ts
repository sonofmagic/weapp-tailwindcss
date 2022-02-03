import postcss from 'postcss'
import { mpPreflight } from './mp'
export function cssSelectorReplacer (selector: string) {
  return selector
    .replace(/\\\[/g, '_l_')
    .replace(/\\\]/g, '_r_')
    .replace(/\\\(/g, '_p_')
    .replace(/\\\)/g, '_q_')
    .replace(/\\#/g, '_h_')
    .replace(/\\!/g, '_i_') //! important
    .replace(/\\\//g, '-div-')
    .replace(/\\\./g, '-dot-')
}

const isMp = true
export function styleHandler (rawSource: string) {
  const root = postcss.parse(rawSource)
  root.walk((node, idx) => {
    if (node.type === 'rule') {
      if (isMp) {
        // 引用传递
        mpPreflight(node)
        node.selector = cssSelectorReplacer(node.selector)
      }
    } else if (node.type === 'comment') {
      node.remove()
    }
  })
  return root.toString()
}
