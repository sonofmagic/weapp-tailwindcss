import postcss, { Processor } from 'postcss'
import path from 'path'
import fs from 'fs'
import tailwindcss from 'tailwindcss'
// import tailwindcss318 from 'tailwindcss318'
describe('postcss plugin', () => {
  let baseProcessor: Processor
  let baseCss: string
  beforeAll(() => {
    baseProcessor = postcss([
      require('autoprefixer')(),
      require('tailwindcss')({ config: path.resolve(__dirname, './config/tailwind.config.js') }),
      require('postcss-rem-to-responsive-pixel')({
        rootValue: 32,
        propList: ['*'],
        transformUnit: 'rpx'
      })
    ])
    baseCss = fs.readFileSync(path.resolve(__dirname, './config/base.css'), {
      encoding: 'utf8'
    })
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

  it('@apply space-y/x case', async () => {
    const processor = postcss([
      tailwindcss({
        content: [
          {
            raw: '<view class="test"></view>'
          }
        ]
      })
    ])
    const res = await processor.process('@tailwind utilities;.test{\n@apply space-x-1 space-y-2 text-[#123456];\n font-size:20px}', {
      from: 'index.css',
      to: 'index.css'
    })
    expect(res.css.toString()).toMatchSnapshot()
  })
})

// 1.20.0 通过 patch 策略修复了这个问题
// describe.skip('tailwindcss3.1.8 and tailwindcss3.2.1 get different result when use border arbitrary values', () => {
//   it('tailwindcss3.2.1 case', async () => {
//     const processor = postcss([
//       tailwindcss({
//         content: [
//           {
//             raw: '<div class="border-t-[4rpx] border-b-[4px]"></div>'
//           }
//         ]
//       })
//     ])
//     const { css } = await processor.process('@tailwind utilities;', {
//       from: 'index.css',
//       to: 'index.css',
//       map: false
//     })
//     expect(css).toBe('.border-b-\\[4px\\] {\n    border-bottom-width: 4px\n}\n.border-t-\\[4rpx\\] {\n    border-top-color: 4rpx\n}')
//   })

//   it('tailwindcss3.1.8 case', async () => {
//     const processor = postcss([
//       tailwindcss318({
//         content: [
//           {
//             raw: '<div class="border-t-[4rpx] border-b-[4px]"></div>'
//           }
//         ]
//       })
//     ])
//     const { css } = await processor.process('@tailwind utilities;', {
//       from: 'index.css',
//       to: 'index.css',
//       map: false
//     })
//     expect(css).toBe('.border-t-\\[4rpx\\] {\n    border-top-width: 4rpx\n}\n.border-b-\\[4px\\] {\n    border-bottom-width: 4px\n}')
//   })
// })
