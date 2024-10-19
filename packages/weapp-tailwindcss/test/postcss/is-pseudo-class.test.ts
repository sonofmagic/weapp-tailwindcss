/* eslint-disable style/no-tabs */
import postcss from 'postcss'
// @ts-ignore
import isPseudoClass from '@csstools/postcss-is-pseudo-class'

describe('is-pseudo-class', () => {
  it('case 0', async () => {
    const res = await postcss([isPseudoClass({
      // preserve: true,
    })]).process(`:is(input, button):is(:hover, :focus) {
	order: 1;
}`)
    expect(res.css).toMatchSnapshot()
  })

  it('case 1', async () => {
    const res = await postcss([isPseudoClass({
      // preserve: true,
    })]).process(`:is(.alpha > .beta) ~ :is(:focus > .beta) {
	order: 2;
}`)
    expect(res.css).toMatchSnapshot()
  })

  it('case 2', async () => {
    const res = await postcss([isPseudoClass({
      // preserve: true,
    })]).process(`#app-provider :is(.space-x-4>view+view) {
    --tw-space-x-reverse: 0;
    margin-right: calc(1rem * var(--tw-space-x-reverse));
    margin-left: calc(1rem * calc(1 - var(--tw-space-x-reverse)))
}`)
    expect(res.css).toMatchSnapshot()
  })
})
