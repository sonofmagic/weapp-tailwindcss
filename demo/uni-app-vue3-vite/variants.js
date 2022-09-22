const aliasList = Object.entries({
  // https://developer.mozilla.org/en-US/docs/Web/CSS/Child_combinator
  '>': ['children', 'child'],
  // https://developer.mozilla.org/en-US/docs/Web/CSS/Descendant_combinator
  ' ': ['heir', 'descendant'],
  // https://developer.mozilla.org/en-US/docs/Web/CSS/General_sibling_combinator
  '~': ['sibling', 'twin'],
  // https://developer.mozilla.org/en-US/docs/Web/CSS/Adjacent_sibling_combinator
  '+': ['next']
})
const fallbackElementTags = ['view', 'text']
// const placeholderElements = ['view'] // , 'text'
// https://developers.weixin.qq.com/miniprogram/dev/component/cover-image.html
const elements = [
  // general selector
  '',
  ...fallbackElementTags
]
// .child_c_text-red-500>view:not(.not-child),text:not(.not-child)
const variants = elements.map((element) => {
  return aliasList.map(([selector, aliases]) => {
    return aliases.map((alias) => {
      const variant = alias + (element ? `-${element}` : '')
      const multiple = []
      if (element) {
        const base = ['&']
        selector !== ' ' && base.push(selector)
        base.push(`${element}:not(.not-${variant})`)
        multiple.push(base.join(' '))
      } else {
        for (let i = 0; i < fallbackElementTags.length; i++) {
          const e = fallbackElementTags[i]
          const base = ['&']
          selector !== ' ' && base.push(selector)
          base.push(`${e}:not(.not-${variant})`)
          multiple.push(base.join(' '))
        }
      }

      return [variant, multiple]
    })
  })
})

function each (cb) {
  variants.forEach((v) => {
    v.forEach((x) => {
      x.forEach((y) => {
        cb(y)
      })
    })
  })
}

module.exports = {
  each,
  variants
}
