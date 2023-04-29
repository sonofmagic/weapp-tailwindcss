import postcss from 'postcss'
import tailwindcss from 'tailwindcss'

export async function getCss(content: string[], plugins: any[] = []) {
  const processor = postcss([
    tailwindcss({
      content: content.map((x) => {
        return {
          raw: x
        }
      }),
      plugins
    })
  ])
  const res = await processor.process('@tailwind utilities;', {
    from: 'index.css',
    to: 'index.css'
  })
  return res
}
