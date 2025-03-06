import { clsx } from 'clsx'

describe('clsx', () => {
  it('repeat', () => {
    // @ts-ignore
    // eslint-disable-next-line tailwindcss/no-contradicting-classname
    const res = clsx('px-[35px]', [1 && 'px-[35px]', { 'px-[35px]': false }, ['px-[35px]', ['px-[35px]']]], 'px-[35px]')
    expect(res).toBe('px-[35px] px-[35px] px-[35px] px-[35px] px-[35px]')
  })
})
