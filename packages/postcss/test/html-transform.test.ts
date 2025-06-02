import postcss from 'postcss'
import htmlTransform from '@/html-transform'

describe('html-transform', () => {
  it('removeUniversal true', async () => {
    const { css } = await postcss([htmlTransform({
      removeUniversal: true,
    })]).process(`
    *{}
      * div{}
      * > p{}
      * + span{}
      * ~ a{}
      * .class{}
      * #id{}
      *[attr]{}
      *:not(.class){}
      *:not(#id){}
      *:not([attr]){}
      #app * span{}
      #app > * + span{}
      #app ~ * > a{}
      #app > * + span{}
      #app > * + span > a{}
      #app > * + span > a + b{}
    
      `)
    expect(css.trim()).toBe(``)
  })

  it('should ', async () => {
    const { css } = await postcss([htmlTransform()]).process(`
    *{}
      * div{}
      * > p{}
      * + span{}
      * ~ a{}
      * .class{}
      * #id{}
      *[attr]{}
      *:not(.class){}
      *:not(#id){}
      *:not([attr]){}
      #app * span{}
      #app > * + span{}
      #app ~ * > a{}
      #app > * + span{}
      #app > * + span > a{}
      #app > * + span > a + b{}
    
      `)
    expect(css.trim()).toMatchSnapshot(``)
  })
})
