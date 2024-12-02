import creator from '@/postcss'
import path from 'pathe'
import postcss from 'postcss'
import tailwindcss from 'tailwindcss'

describe('postcss', () => {
  it('process case 0', async () => {
    const { css } = await postcss([creator]).process(`
@tailwind base;
@tailwind components;
@tailwind utilities;
      
      `, {
      from: 'xxxx',
    })
    expect(css).toMatchSnapshot()
  })

  it('process case 1', async () => {
    const { css } = await postcss([tailwindcss]).process(`
@tailwind base;
@tailwind components;
@tailwind utilities;
      
      `, {
      from: 'yyyy',
    })
    expect(css).toMatchSnapshot()
  })

  it('process case 2', async () => {
    const { css } = await postcss([creator]).process(``, {
      from: path.resolve(__dirname, './fixtures/com/index.css'),
    })
    expect(css).toMatchSnapshot()
  })
})
