import postcss from 'postcss'
import tailwindcss from 'tailwindcss'

export async function getCss(content: string[]) {
  const processor = postcss([
    tailwindcss({
      content: content.map((x) => {
        return {
          raw: x
        }
      })
      // plugins: []
    })
  ])
  const { css } = await processor.process('@tailwind utilities;', {
    from: 'index.css',
    to: 'index.css'
  })
  return css.toString()
}
