import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import { vi } from 'vitest'
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

  it('warns when variant selectors are invalid', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await postcss([tailwindcss({
      darkMode: ['variant', ['.dark', '.theme-mode']],
      content: [{ raw: 'dark' }],
      corePlugins: {
        preflight: false,
      },
      plugins: [themeTransitionPlugin()],
    })]).process('@tailwind base; @tailwind components; @tailwind utilities;')

    const messages = warn.mock.calls.map(call => call[0])
    expect(messages.some(message => typeof message === 'string' && message.includes('must provide a selector'))).toBe(true)
    expect(messages.some(message => typeof message === 'string' && message.includes('must contain `&`'))).toBe(true)
    warn.mockRestore()
  })

  it('accepts functional variant selectors', async () => {
    const { css } = await postcss([tailwindcss({
      darkMode: ['variant', () => '.app &'],
      content: [{ raw: 'dark' }],
      corePlugins: {
        preflight: false,
      },
      plugins: [themeTransitionPlugin()],
    })]).process('@tailwind base; @tailwind components; @tailwind utilities;')

    expect(css).toContain('::view-transition-old(root)')
  })

  it('invokes addBase when using functional selectors without Tailwind runner', () => {
    const addBase = vi.fn()
    const config = vi.fn().mockReturnValue(['variant', () => '.shell &'])

    const pluginInstance: any = themeTransitionPlugin()
    const handler = typeof pluginInstance === 'function' ? pluginInstance : pluginInstance?.handler

    handler?.({ addBase, config })

    expect(addBase).toHaveBeenCalled()
  })

  it('handles missing selectors when variant mode is enabled', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await postcss([tailwindcss({
      darkMode: ['variant'],
      content: [{ raw: 'dark' }],
      corePlugins: {
        preflight: false,
      },
      plugins: [themeTransitionPlugin()],
    })]).process('@tailwind base; @tailwind components; @tailwind utilities;')

    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('tolerates non-string variant selectors when invoked directly', () => {
    const addBase = vi.fn()
    const config = vi.fn().mockReturnValue(['variant', null])

    const pluginInstance: any = themeTransitionPlugin()
    const handler = typeof pluginInstance === 'function' ? pluginInstance : pluginInstance?.handler

    handler?.({ addBase, config })
    expect(addBase).toHaveBeenCalled()
  })
})
