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
const fallbackElementTag = 'view'
// const placeholderElements = ['view'] // , 'text'
// https://developers.weixin.qq.com/miniprogram/dev/component/cover-image.html
const elements = [
  // general selector
  '',
  fallbackElementTag,
  'text'
]
// .child_c_text-red-500>view:not(.not-child),text:not(.not-child)
const variants = elements.map((element) => {
  return aliasList.map(([selector, aliases]) => {
    return aliases.map((alias) => {
      const variant = alias + (element ? `-${element}` : '')
      const base = ['&']
      selector && base.push(selector)
      base.push(`${element || fallbackElementTag}:not(.not-${variant})`)
      // const added = {
      //   '~': `&:not(.not-${variant})`,
      //   ' ': `& ${selector}` + ` ${placeholderElements.map((x) => `${x}:not(.not-${variant}) ${element}`).join(',')}`
      // }[selector]

      return [variant, base.join(' ')] // added ? [base, added] : base]
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
