import { getCompilerContext } from '@/context'

describe('resolving ambiguities', () => {
  it('text-[22px]', async () => {
    const { templateHandler } = getCompilerContext()
    expect(await templateHandler('<div class="text-[22px]">...</div>')).toMatchSnapshot()
  })

  it('text-[#bada55]', async () => {
    const { templateHandler } = getCompilerContext()
    expect(await templateHandler('<div class="text-[#bada55]">...</div>')).toMatchSnapshot()
  })

  it('text-[var(--my-var)]', async () => {
    const { templateHandler } = getCompilerContext()
    expect(await templateHandler('<div class="text-[var(--my-var)]">...</div>')).toMatchSnapshot()
  })

  it('text-[length:var(--my-var)]', async () => {
    const { templateHandler } = getCompilerContext()
    expect(await templateHandler('<div class="text-[length:var(--my-var)]">...</div>')).toMatchSnapshot()
  })

  it('text-[color:var(--my-var)]', async () => {
    const { templateHandler } = getCompilerContext()
    expect(await templateHandler('<div class="text-[color:var(--my-var)]">...</div>')).toMatchSnapshot()
  })
})
