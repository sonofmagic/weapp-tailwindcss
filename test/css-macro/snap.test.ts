import path from 'node:path'
import postcss from 'postcss'
import { cssCasePath, createGetCase } from '#test/util'
import creator from '@/css-macro/postcss'
const getCase = createGetCase(path.resolve(cssCasePath, 'css-macro'))

describe('snap', () => {
  it('uni-app vue2 app.css', async () => {
    const { css } = await postcss([creator]).process(await getCase('app.css'), {
      from: undefined
    })
    expect(css).toMatchSnapshot()
  })

  it('uni-app vue2 page.css', async () => {
    const { css } = await postcss([creator]).process(await getCase('page.css'), {
      from: undefined
    })
    expect(css).toMatchSnapshot()
  })

  it('uni-app vue2 app-with-comment.css', async () => {
    const { css } = await postcss([creator]).process(await getCase('app-with-comment.css'), {
      from: undefined
    })
    expect(css).toMatchSnapshot()
  })
})
