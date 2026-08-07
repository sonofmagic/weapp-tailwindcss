import { createWeappTailwindcssGenerator, resolveTailwindV4Source } from 'weapp-tailwindcss/generator'

const arbitraryUtilities = [
  'w-[123px]',
  'h-[45rpx]',
  'min-w-[calc(100%-2rem)]',
  'max-h-[var(--panel-height)]',
  'bg-[#123456]',
  'bg-[rgb(12,34,56)]',
  'bg-[radial-gradient(circle_at_20%_20%,#fff,#000)]',
  'text-[length:23px]',
  'text-[color:#c31d6b]',
  'leading-[1.25]',
  'tracking-[0.12em]',
  'p-[13px]',
  'px-[7.5px]',
  'rounded-[18px]',
  '[mask-type:luminance]',
  '[--panel-height:240px]',
  'bg-(--brand-color)',
  'text-black/[.35]',
  '!bg-[gray]',
  'hover:bg-[red]',
  'md:w-[200px]',
  'dark:text-[color:#fff]',
  'data-[state=open]:opacity-100',
  'supports-[backdrop-filter:blur(2px)]:backdrop-blur-[2px]',
  'before:content-[\'lynx\']',
  'group-[.is-active]:block',
  'aria-[sort=ascending]:underline',
  'aspect-[4/3]',
  'grid-cols-[200px_minmax(0,1fr)_80px]',
]

const css = [
  '@import "tailwindcss" source(none);',
  `@source inline("${arbitraryUtilities.join(' ')}");`,
].join('\n')

const expectedDeclarations = [
  'aspect-ratio: 4/3',
  'height: 45rpx',
  'max-height: var(--panel-height)',
  'width: 123px',
  'min-width: calc(100% - 2rem)',
  'grid-template-columns: 200px minmax(0,1fr) 80px',
  'border-radius: 18px',
  'background-color: gray !important',
  'background-color: var(--brand-color)',
  'background-color: #123456',
  'background-color: rgb(12,34,56)',
  'background-image: radial-gradient(circle at 20% 20%,#fff,#000)',
  'mask-type: luminance',
  'padding: 13px',
  'padding-inline: 7.5px',
  'font-size: 23px',
  'line-height: 1.25',
  'letter-spacing: 0.12em',
  'color: #c31d6b',
  'color-mix(in srgb, #000 35%, transparent)',
  '--panel-height: 240px',
  'display: block',
  '--tw-content: \'lynx\'',
  'background-color: red',
  'text-decoration-line: underline',
  'opacity: 100%',
  '--tw-backdrop-blur: blur(2px)',
  'width: 200px',
  'color: #fff',
]

describe('Tailwind CSS v4 arbitrary Lynx utilities', () => {
  it('generates web CSS for arbitrary values and variants without rewriting them', async () => {
    const source = await resolveTailwindV4Source({ css, base: process.cwd() })
    const generator = createWeappTailwindcssGenerator(source)
    const result = await generator.generate({ target: 'web' })

    expect(result.css).toBe(result.rawCss)
    expect(result.css).not.toContain('@import "tailwindcss"')
    expect([...result.classSet]).toEqual(expect.arrayContaining(arbitraryUtilities))
    for (const declaration of expectedDeclarations) {
      expect(result.css, `missing generated declaration ${declaration}`).toContain(declaration)
    }
  })
})
