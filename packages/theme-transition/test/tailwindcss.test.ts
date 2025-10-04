import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import pluginDefault, { themeTransitionPlugin } from '@/tailwindcss'

describe('tailwindcss', () => {
  it('exports matching default and named plugins', () => {
    expect(typeof pluginDefault).toBe('function')
    expect(pluginDefault).toBe(themeTransitionPlugin)
  })

  it('themeTransitionPlugin', async () => {
    const { css } = await postcss([tailwindcss({
      config: {
        content: [{
          raw: 'dark',
        }],
        corePlugins: {
          preflight: false,
        },
        plugins: [themeTransitionPlugin()],
      },
    })]).process(`@tailwind base;
      @tailwind components;
      @tailwind utilities;`)
    expect(css).toMatchSnapshot()
  })

  it('themeTransitionPlugin darkMode selector case 0', async () => {
    const { css } = await postcss([tailwindcss({
      darkMode: 'selector',
      content: [{
        raw: 'dark',
      }],
      corePlugins: {
        preflight: false,
      },
      plugins: [themeTransitionPlugin()],
    })]).process(`@tailwind base;
      @tailwind components;
      @tailwind utilities;`)
    expect(css).toMatchSnapshot()
  })

  it('themeTransitionPlugin darkMode selector case 1', async () => {
    const { css } = await postcss([tailwindcss({
      darkMode: ['selector', '[data-mode="dark"]'],
      content: [{
        raw: 'dark',
      }],
      corePlugins: {
        preflight: false,
      },
      plugins: [themeTransitionPlugin()],
    })]).process(`@tailwind base;
      @tailwind components;
      @tailwind utilities;`)
    expect(css).toMatchSnapshot()
  })

  it('themeTransitionPlugin darkMode variant case 0', async () => {
    const { css } = await postcss([tailwindcss({
      darkMode: ['variant', '&:not(.light *)'],
      content: [{
        raw: 'dark',
      }],
      corePlugins: {
        preflight: false,
      },
      plugins: [themeTransitionPlugin()],
    })]).process(`@tailwind base;
      @tailwind components;
      @tailwind utilities;`)
    expect(css).toMatchSnapshot()
  })

  it('themeTransitionPlugin darkMode variant case 1', async () => {
    const { css } = await postcss([tailwindcss({
      darkMode: ['variant', [
        '@media (prefers-color-scheme: dark) { &:not(.light *) }',
        '&:is(.dark *)',
      ]],
      content: [{
        raw: 'dark',
      }],
      corePlugins: {
        preflight: false,
      },
      plugins: [themeTransitionPlugin()],
    })]).process(`@tailwind base;
      @tailwind components;
      @tailwind utilities;`)
    expect(css).toMatchSnapshot()
  })
})
