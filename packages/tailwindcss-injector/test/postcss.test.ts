import creator from '@/postcss'
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
})
