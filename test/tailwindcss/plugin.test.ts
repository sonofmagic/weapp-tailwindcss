import { getCss as _getCss } from '#test/helpers/getTwCss'

function getCss(content: string[]) {
  return _getCss(content, [require('tailwind-children')])
}
describe('tailwind plugins', () => {
  it('tailwind-children case0', async () => {
    const res = await getCss([
      `<div class="child:ring-white">
    <p>I have a white ring.</p>
</div>`
    ])
    expect(res.css.toString()).toMatchSnapshot()
  })

  it('tailwind-children case1', async () => {
    const res = await getCss([
      `<!-- apply to <p> elements, with shadow on hover -->
            <div class="child-p:ring-white hover:child-p:border">
                <p>I have a white ring, and a border on hover.</p>
                <b>I am ignored!</b>
            </div>`
    ])

    expect(res.css.toString()).toMatchSnapshot()
  })

  it('tailwind-children case2', async () => {
    const res = await getCss([
      `<div class="heir-p:ring-white hover:descendant-p:shadow">
      <div>
          <p>I have a white ring...</p>
      </div>
      <div>
          <p>And a shadow on hover!</p>
          <b>I am not a \`p\`, so am ignored.</b>
      </div>
  </div>`
    ])

    expect(res.css.toString()).toMatchSnapshot()
  })

  it('tailwind-children case3', async () => {
    const res = await getCss([
      `<div>
      <p class="twin:ring-white hover:twin:shadow">
          I have a white ring & shadow on hover
      </p>
      <p>I am his twin, so have the same!</p>
  </div>`
    ])

    expect(res.css.toString()).toMatchSnapshot()
  })

  it('tailwind-children case4', async () => {
    const res = await getCss([
      `<div class="mt-3 flex -space-x-2 overflow-hidden
            child:inline-block child:h-12 child:w-12 child:rounded-full child:ring-2 child:ring-white hover:child:shadow">
            <img src="/img0.jpg">
            <img src="/img1.jpg">
            <img src="/img2.jpg">
            <img src="/img3.jpg">
            <img src="/img4.jpg">
        </div>`
    ])

    expect(res.css.toString()).toMatchSnapshot()
  })
})
