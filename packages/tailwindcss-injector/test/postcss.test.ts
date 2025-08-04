import path from 'pathe'
import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import creator from '@/postcss'

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

  it('process case 3', async () => {
    const { css } = await postcss([creator({
      config: {
        plugins: [
          plugin(({ addComponents, addUtilities }) => {
            addComponents({
              '.btn': {
                color: 'red',
              },
            })
            addUtilities({
              '.swap': {
                color: 'blue',
              },
            })
          }),
        ],
      },
    })]).process(``, {
      from: path.resolve(__dirname, './fixtures/com/index.css'),
    })
    expect(css).toMatchSnapshot()
  })

  it('process case 4', async () => {
    const { css } = await postcss([creator({
      config: {
        plugins: [
          plugin(({ addComponents, addUtilities }) => {
            addComponents({
              '.btn': {
                color: 'red',
              },
            })
            addUtilities({
              '.swap': {
                color: 'blue',
              },
            })
          }),
        ],
      },
    })]).process(``, {
      from: path.resolve(__dirname, './fixtures/wxml/index.wxss'),
    })
    expect(css).toMatchSnapshot()
  })

  it('process case 5', async () => {
    const { css } = await postcss([creator({})]).process(``, {
      from: path.resolve(__dirname, './fixtures/wxml/index.wxss'),
    })
    expect(css).toMatchSnapshot()
  })

  it('process case 6', async () => {
    const { css } = await postcss([creator()]).process(`@import 'xxx';\n@use 'yyy';\n`, {
      from: path.resolve(__dirname, './fixtures/empty/index.wxss'),
    })
    expect(css).toMatchSnapshot()
  })

  it('process case 7', async () => {
    const { css } = await postcss([creator()]).process(`@import 'xxx';\n@tailwind utilities;@use 'yyy';\n`, {
      from: path.resolve(__dirname, './fixtures/empty/index.wxss'),
    })
    expect(css).toMatchSnapshot()
  })

  it('process case 8', async () => {
    const { css } = await postcss([creator()]).process(`@tailwind utilities;@import 'xxx';\n@use 'yyy';\n`, {
      from: path.resolve(__dirname, './fixtures/empty/index.wxss'),
    })
    expect(css).toMatchSnapshot()
  })

  it('process case 9', async () => {
    const { css } = await postcss([creator()]).process(`/*  @import  xxx.less  */`, {
      from: path.resolve(__dirname, './fixtures/empty/index.wxss'),
    })
    expect(css).toMatchSnapshot()
  })

  it('process case 10', async () => {
    const { css } = await postcss([creator()]).process(`/*  @import  'xxx.less'  */`, {
      from: path.resolve(__dirname, './fixtures/empty/index.wxss'),
    })
    expect(css).toMatchSnapshot()
  })

  it('process case 11', async () => {
    const { css } = await postcss([creator()]).process(`/*  @import  'xxx.less'  */\n@import 'xxx';`, {
      from: path.resolve(__dirname, './fixtures/empty/index.wxss'),
    })
    expect(css).toMatchSnapshot()
  })

  it('process case 12', async () => {
    const { css } = await postcss([creator()]).process(`@import 'xxx';\n/*  @import  'xxx.less'  */\n`, {
      from: path.resolve(__dirname, './fixtures/empty/index.wxss'),
    })
    expect(css).toMatchSnapshot()
  })
})
