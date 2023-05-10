import { getCss } from './helpers/getTwCss'
// import { getClassCacheSet } from 'tailwindcss-patch'
// import tailwindcss318 from 'tailwindcss318'
// import fs from 'fs'
describe('postcss plugin', () => {
  it('base tw output', async () => {
    const res = await getCss('', {
      css: '@tailwind base;@tailwind utilities;'
    })
    expect(res.css.toString()).toMatchSnapshot()
  })

  it('base tw output without prefilight', async () => {
    const res = await getCss('', {
      css: '@tailwind base;@tailwind utilities;',
      twConfig: {
        corePlugins: {
          preflight: false
        }
      }
    })
    expect(res.css.toString()).toMatchSnapshot()
  })

  it('base utilities output', async () => {
    const res = await getCss('<view class="h-10 w-10 bg-[rgba(255,254,253,.5)]"></view>')
    expect(res.css.toString()).toMatchSnapshot()
  })

  it("before:content-['+']", async () => {
    const res = await getCss('<view class="before:content-[\'+\']"></view>')
    expect(res.css.toString()).toMatchSnapshot()
  })

  it("utf-8 compat after:content-['我是伪元素']", async () => {
    const res = await getCss("<view class=\"after:content-['我是伪元素']")
    expect(res.css.toString()).toMatchSnapshot()
    // fs.writeFileSync('./utf8.css', res.css.toString(), 'utf-8')
  })

  it('@apply space-y/x case', async () => {
    const res = await getCss('<view class="test"></view>', {
      css: '@tailwind utilities;.test{\n@apply space-x-1 space-y-2 text-[#123456];\n font-size:20px}'
    })
    expect(res.css.toString()).toMatchSnapshot()
  })

  it('double quote after class', async () => {
    // after:content-[\"*\"]
    const res = await getCss('<view class="after:content-["对酒当歌，人生几何"]"></view>')
    // const set = getClassCacheSet()
    // const y = 'after:content-["对酒当歌，人生几何"]'
    expect(res.css.toString()).toMatchSnapshot()
  })

  it('single quote after class', async () => {
    // after:content-[\"*\"]
    const res = await getCss('<view class="after:content-[\'对酒当歌，人生几何\']"></view>')
    // const set = getClassCacheSet()
    // const y = 'after:content-["对酒当歌，人生几何"]'
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
