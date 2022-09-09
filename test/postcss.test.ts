import postcss from 'postcss'
import path from 'path'
import fs from 'fs'
import tailwindcss from 'tailwindcss'
describe('postcss plugin', () => {
  const baseProcessor = postcss([
    require('autoprefixer')(),
    require('tailwindcss')({ config: path.resolve(__dirname, './config/tailwind.config.js') }),
    require('postcss-rem-to-responsive-pixel')({
      rootValue: 32,
      propList: ['*'],
      transformUnit: 'rpx'
    })
  ])
  const baseCss = fs.readFileSync(path.resolve(__dirname, './config/base.css'), {
    encoding: 'utf8'
  })
  it('base tw output', async () => {
    const res = await baseProcessor.process(baseCss, {
      from: 'index.css',
      to: 'index.css'
    })
    expect(res.css.toString()).toMatchSnapshot()
  })

  it('base utilities output', async () => {
    const processor = postcss([
      tailwindcss({
        content: [
          {
            raw: '<view class="h-10 w-10 bg-[rgba(255,254,253,.5)]"></view>'
          }
        ]
      })
    ])
    const res = await processor.process('@tailwind utilities;', {
      from: 'index.css',
      to: 'index.css'
    })
    expect(res.css.toString()).toMatchSnapshot()
  })

  it("before:content-['+']", async () => {
    const processor = postcss([
      tailwindcss({
        content: [
          {
            raw: '<view class="before:content-[\'+\']"></view>'
          }
        ]
      })
    ])
    const res = await processor.process('@tailwind utilities;', {
      from: 'index.css',
      to: 'index.css'
    })
    expect(res.css.toString()).toMatchSnapshot()
  })
})
