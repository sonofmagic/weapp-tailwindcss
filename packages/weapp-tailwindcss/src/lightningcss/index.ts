import { Buffer } from 'node:buffer'
import { createLightningcssStyleHandler } from './style-handler'

const defaultHandler = createLightningcssStyleHandler(undefined, {
  transformOptions: { minify: true },
})

export { createLightningcssStyleHandler }

export async function transformCss(css: string | Buffer = '.foo { color: red }') {
  const result = await defaultHandler(
    typeof css === 'string' ? css : css.toString(),
  )

  return {
    ...result,
    code: Buffer.from(result.code),
    map: result.map ? Buffer.from(result.map) : undefined,
  }
}
