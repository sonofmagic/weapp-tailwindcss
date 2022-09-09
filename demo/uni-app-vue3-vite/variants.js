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

const placeholderElements = ['view'] // , 'text'
// https://developers.weixin.qq.com/miniprogram/dev/component/cover-image.html
const elements = [
  // general selector
  '',
  ...placeholderElements,
  'text'
]
// .child_c_text-red-500>view:not(.not-child),text:not(.not-child)
const variants = elements.map((element) => {
  return aliasList.map(([selector, aliases]) => {
    return aliases.map((alias) => {
      const variant = alias + (element ? `-${element}` : '')
      const base = `& ${selector} ` + placeholderElements.map((e) => `${e}:not(.not-${variant})`).join(',') // `& ${selector} ` + (element ? `${element}:not(.not-${variant})` : placeholderElements.map((element) => `${element}::not(.not-${variant})`).join(','))
      // const added = {
      //   '~': `&:not(.not-${variant})`,
      //   ' ': `& ${selector}` + ` ${placeholderElements.map((x) => `${x}:not(.not-${variant}) ${element}`).join(',')}`
      // }[selector]

      return [variant, base] // added ? [base, added] : base]
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
