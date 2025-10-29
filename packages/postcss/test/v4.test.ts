import fs from 'fs-extra'
import path from 'pathe'
import { createStyleHandler } from '@/index'

describe('v4', () => {
  it('vite', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = await fs.readFile(path.resolve(__dirname, './fixtures/css/v4-vite.css'), 'utf8')
    const { css } = await styleHandler(code)
    expect(css).toMatchSnapshot()
  })

  it('postcss', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = await fs.readFile(path.resolve(__dirname, './fixtures/css/v4-postcss.css'), 'utf8')
    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })

  it('postcss uni-app x', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
      uniAppX: true,
    })
    const code = await fs.readFile(path.resolve(__dirname, './fixtures/css/v4-postcss.css'), 'utf8')
    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })

  it('v4', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = await fs.readFile(path.resolve(__dirname, './fixtures/css/v4.css'), 'utf8')
    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
    fs.writeFile(path.resolve(__dirname, './fixtures/css/v4.out.css'), css, 'utf8')
  })

  it('v4.1.1', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = await fs.readFile(path.resolve(__dirname, './fixtures/css/v4.1.1.css'), 'utf8')
    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
    fs.writeFile(path.resolve(__dirname, './fixtures/css/v4.1.1.out.css'), css, 'utf8')
  })

  it('v4.1.2', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = await fs.readFile(path.resolve(__dirname, './fixtures/css/v4.1.2.css'), 'utf8')
    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
    fs.writeFile(path.resolve(__dirname, './fixtures/css/v4.1.2.out.css'), css, 'utf8')
  })

  it('v4 space-y-*', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    // .space-x-2d5>view+view,.space-x-2d5>view+text,.space-x-2d5>text+view,.space-x-2d5>text+text {
    //   --tw-space-x-reverse: 0;
    //   margin-right: calc(20rpx * var(--tw-space-x-reverse));
    //   margin-left: calc(20rpx * (1 - var(--tw-space-x-reverse)));
    //   margin-left: calc(20rpx * calc(1 - var(--tw-space-x-reverse)));
    // }
    const code = `
      :where(.space-y-0 > :not(:last-child)) {
    --tw-space-y-reverse: 0;
    margin-block-start: calc(calc(var(--spacing) * 0) * var(--tw-space-y-reverse));
    margin-block-end: calc(calc(var(--spacing) * 0) * calc(1 - var(--tw-space-y-reverse)));
  }
    `
    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })

  it('v4 space-y-* nesting', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = `
.space-y-0 {
  & > :not(:last-child) {
    --tw-space-y-reverse: 0;
    margin-block-start: calc(calc(var(--spacing) * 0) * var(--tw-space-y-reverse));
    margin-block-end: calc(calc(var(--spacing) * 0) * calc(1 - var(--tw-space-y-reverse)));
  }
}
`
    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })

  it('v4 space-y-* case 2', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
      cssChildCombinatorReplaceValue: ['view', 'text'],
    })
    const code = `
:where(.space-y-0 > :not(:last-child)) {}
    `
    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })

  it('--tw-gradient-position', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = `.bg-gradient-to-b:not(n):not(n):not(n) {
    --tw-gradient-position: to bottom in oklab;
    background-image: linear-gradient(var(--tw-gradient-stops));
  }
.bg-gradient-to-t:not(n):not(n):not(n) {
    --tw-gradient-position: to top in oklab;
    background-image: linear-gradient(var(--tw-gradient-stops));
  }
.bg-gradient-to-tr:not(n):not(n):not(n) {
    --tw-gradient-position: to top right in oklab;
    background-image: linear-gradient(var(--tw-gradient-stops));
  }`
    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
  })

  it('v4.1.1 uni-app vue 3', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = `/*! tailwindcss v4.1.1 | MIT License | https://tailwindcss.com */
@supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color: rgb(from red r g b)))) {
  @layer base {
    *, :before, :after, ::backdrop {
      --tw-font-weight: initial;
    }
  }
}

@supports (((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b)))) {

  ::before,
  ::after {
    --tw-content: ""
  }

}

:root, :host {
  --color-white: #fff;
  --spacing: .25rem;
  --font-weight-bold: 700;
}

*, :after, :before, ::backdrop {
  box-sizing: border-box;
  border: 0 solid;
  margin: 0;
  padding: 0;
}

.i-mdi-home {
  width: 1em;
  height: 1em;
  -webkit-mask-image: var(--svg);
  -webkit-mask-image: var(--svg);
  -webkit-mask-image: var(--svg);
  mask-image: var(--svg);
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='black' d='M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z'/%3E%3C/svg%3E");
  background-color: currentColor;
  display: inline-block;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

.flex {
  display: flex;
}

.aspect-\\(--my-aspect-ratio\\) {
  aspect-ratio: var(--my-aspect-ratio);
}

.aspect-\\[calc\\(4\\*3\\+1\\)\\/3\\] {
  aspect-ratio: 13 / 3;
}

.h-20 {
  height: calc(var(--spacing) * 20);
}

.w-20 {
  width: calc(var(--spacing) * 20);
}

.flex-col {
  flex-direction: column;
}

.bg-\\[\\#0000ff\\] {
  background-color: #00f;
}

.text-\\[45rpx\\] {
  font-size: 45rpx;
}

.text-\\[88rpx\\] {
  font-size: 88rpx;
}

.font-bold {
  --tw-font-weight: var(--font-weight-bold);
  font-weight: var(--font-weight-bold);
}

.text-\\[\\#00f285\\] {
  color: #00f285;
}

.text-white {
  color: var(--color-white);
}

.underline {
  text-decoration-line: underline;
}

@property --tw-font-weight {
  syntax: "*";
  inherits: false
}


/* @import 'tailwindcss'; */
page{--status-bar-height:25px;--top-window-height:0px;--window-top:0px;--window-bottom:0px;--window-left:0px;--window-right:0px;--window-magin:0px}[data-c-h="true"]{display: none !important;}`
    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
    fs.writeFile(path.resolve(__dirname, './fixtures/css/v4.1.1-uniapp-vue3.out.css'), css, 'utf8')
  })

  it('regex', () => {
    function t(str: string) {
      return [
        /-webkit-hyphens\s*:\s*none/,
        /margin-trim\s*:\s*inline/,
        /-moz-orient\s*:\s*inline/,
        /color\s*:\s*rgb\(\s*from\s+red\s+r\s+g\s+b\s*\)/,
      ].every(regex => regex.test(str))
    }
    expect(
      t('(((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b))))'),
    ).toBe(true)
    expect(
      t('((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color: rgb(from red r g b))))'),
    ).toBe(true)
  })

  it('v4.1.2 vite plugin case 0', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = `/*! tailwindcss v4.1.2 | MIT License | https://tailwindcss.com */@layer properties{@supports (((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b)))){*,:before,:after,::backdrop{--tw-space-y-reverse:0;--tw-space-x-reverse:0;--tw-border-style:solid;--tw-gradient-position:initial;--tw-gradient-from:#0000;--tw-gradient-via:#0000;--tw-gradient-to:#0000;--tw-gradient-stops:initial;--tw-gradient-via-stops:initial;--tw-gradient-from-position:0%;--tw-gradient-via-position:50%;--tw-gradient-to-position:100%}}}:root,:host{--color-red-700:oklch(50.5% .213 27.518);--color-amber-300:oklch(87.9% .169 91.605);--spacing:.25rem}*,:after,:before,::backdrop{box-sizing:border-box;border:0 solid;margin:0;padding:0}.container{width:100%}@media (min-width:40rem){.container{max-width:40rem}}@media (min-width:48rem){.container{max-width:48rem}}@media (min-width:64rem){.container{max-width:64rem}}@media (min-width:80rem){.container{max-width:80rem}}@media (min-width:96rem){.container{max-width:96rem}}.i-mdi-home{width:1em;height:1em;-webkit-mask-image:var(--svg);mask-image:var(--svg);--svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='black' d='M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z'/%3E%3C/svg%3E");background-color:currentColor;display:inline-block;-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}.inline-block{display:inline-block}.h-10{height:calc(var(--spacing)*10)}.h-\\[29\\.292px\\]{height:29.292px}.h-\\[30px\\]{height:30px}.h-\\[45px\\]{height:45px}.w-\\[50px\\]{width:50px}.w-\\[323px\\]{width:323px}:where(.space-y-2\\.5>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing)*2.5)*var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing)*2.5)*calc(1 - var(--tw-space-y-reverse)))}:where(.space-x-2\\.5>:not(:last-child)){--tw-space-x-reverse:0;margin-inline-start:calc(calc(var(--spacing)*2.5)*var(--tw-space-x-reverse));margin-inline-end:calc(calc(var(--spacing)*2.5)*calc(1 - var(--tw-space-x-reverse)))}.border-4{border-style:var(--tw-border-style);border-width:4px}.bg-\\[\\#3a32d1\\]{background-color:#3a32d1}.bg-\\[\\#7d7ac2\\]{background-color:#7d7ac2}.bg-amber-300{background-color:var(--color-amber-300)}.bg-gradient-to-b{--tw-gradient-position:to bottom in oklab;background-image:linear-gradient(var(--tw-gradient-stops))}.bg-gradient-to-t{--tw-gradient-position:to top in oklab;background-image:linear-gradient(var(--tw-gradient-stops))}.bg-gradient-to-tr{--tw-gradient-position:to top right in oklab;background-image:linear-gradient(var(--tw-gradient-stops))}.from-\\[\\#2f73f1\\]{--tw-gradient-from:#2f73f1;--tw-gradient-stops:var(--tw-gradient-via-stops,var(--tw-gradient-position),var(--tw-gradient-from)var(--tw-gradient-from-position),var(--tw-gradient-to)var(--tw-gradient-to-position))}.to-\\[\\#4bcefd\\]{--tw-gradient-to:#4bcefd;--tw-gradient-stops:var(--tw-gradient-via-stops,var(--tw-gradient-position),var(--tw-gradient-from)var(--tw-gradient-from-position),var(--tw-gradient-to)var(--tw-gradient-to-position))}.text-\\[100px\\]{font-size:100px}.text-\\[\\#123456\\]{color:#123456}.text-\\[100rpx\\]{color:100rpx}.text-red-700{color:var(--color-red-700)}@property --tw-space-y-reverse{syntax:"*";inherits:false;initial-value:0}@property --tw-space-x-reverse{syntax:"*";inherits:false;initial-value:0}@property --tw-border-style{syntax:"*";inherits:false;initial-value:solid}@property --tw-gradient-position{syntax:"*";inherits:false}@property --tw-gradient-from{syntax:"<color>";inherits:false;initial-value:#0000}@property --tw-gradient-via{syntax:"<color>";inherits:false;initial-value:#0000}@property --tw-gradient-to{syntax:"<color>";inherits:false;initial-value:#0000}@property --tw-gradient-stops{syntax:"*";inherits:false}@property --tw-gradient-via-stops{syntax:"*";inherits:false}@property --tw-gradient-from-position{syntax:"<length-percentage>";inherits:false;initial-value:0%}@property --tw-gradient-via-position{syntax:"<length-percentage>";inherits:false;initial-value:50%}@property --tw-gradient-to-position{syntax:"<length-percentage>";inherits:false;initial-value:100%}
/*$vite$:1*/`
    fs.writeFile(path.resolve(__dirname, './fixtures/css/v4.1.2-vite-plugin.css'), code, 'utf8')
    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
    fs.writeFile(path.resolve(__dirname, './fixtures/css/v4.1.2-vite-plugin.out.css'), css, 'utf8')
  })

  it('v4.1.2 vite plugin case 1', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = await fs.readFile(path.resolve(__dirname, './fixtures/css/v4.1.2-vite-plugin.format.css'), 'utf8')

    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
    fs.writeFile(path.resolve(__dirname, './fixtures/css/v4.1.2-vite-plugin.format.out.css'), css, 'utf8')
  })

  it('v4.1.10 case 0', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = await fs.readFile(path.resolve(__dirname, './fixtures/css/v4.1.10.css'), 'utf8')

    const { css } = await styleHandler(code, {
      isMainChunk: true,
    })
    expect(css).toMatchSnapshot()
    fs.writeFile(path.resolve(__dirname, './fixtures/css/v4.1.10.out.css'), css, 'utf8')
  })
})
