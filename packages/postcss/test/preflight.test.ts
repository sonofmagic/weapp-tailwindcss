import { createInjectPreflight } from '@/preflight'

describe('createInjectPreflight', () => {
  it('stringifies values and skips disabled entries', () => {
    const inject = createInjectPreflight({
      color: 'red',
      fontSize: 16,
      border: false,
      opacity: 0,
    })

    const result = inject()

    expect(result).toEqual([
      { prop: 'color', value: 'red' },
      { prop: 'fontSize', value: '16' },
      { prop: 'opacity', value: '0' },
    ])
    expect(result).toBe(inject())
  })

  it('returns an empty list when preflight is disabled', () => {
    expect(createInjectPreflight(false)()).toEqual([])
    expect(createInjectPreflight(undefined)()).toEqual([])
  })

  it('retains boolean true values', () => {
    const inject = createInjectPreflight({ display: true })

    expect(inject()).toEqual([{ prop: 'display', value: 'true' }])
  })
})
