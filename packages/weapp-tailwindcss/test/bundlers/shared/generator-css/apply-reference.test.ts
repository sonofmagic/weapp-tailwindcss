import { describe, expect, it } from 'vitest'
import { createTailwindV4ApplyReferenceSource } from '@/bundlers/shared/generator-css/source-resolver/apply-reference'

describe('generator css apply reference', () => {
  it('references the only configured Tailwind root for component apply rules', () => {
    const css = '.probe { @apply bg-issue-1021-hmr; }'
    const result = createTailwindV4ApplyReferenceSource(css, {
      cssSources: [
        {
          css: '@import "tailwindcss";\n@theme { --color-issue-1021-hmr: #3b0764; }',
          file: '/project/main.css',
        },
        {
          css,
          file: '/project/components/Probe.uvue?vue&type=style',
        },
      ],
    })

    expect(result).toContain('@reference "/project/main.css";')
    expect(result).toContain('@source inline("bg-issue-1021-hmr");')
    expect(result).not.toContain('@import "tailwindcss" source(none);')
  })

  it('falls back to the Tailwind package when configured roots are ambiguous', () => {
    const result = createTailwindV4ApplyReferenceSource('.probe { @apply flex; }', {
      cssSources: [
        { css: '@import "tailwindcss";', file: '/project/main.css' },
        { css: '@import "tailwindcss";', file: '/project/admin.css' },
      ],
    })

    expect(result).toContain('@import "tailwindcss" source(none);')
    expect(result).not.toContain('@reference')
  })

  it('does not inject a reference into an explicit Tailwind root source', () => {
    const css = '@import "tailwindcss";\n.probe { @apply flex; }'
    const result = createTailwindV4ApplyReferenceSource(css, {
      cssEntries: ['/project/main.css'],
    })

    expect(result).toBe(css)
  })
})
