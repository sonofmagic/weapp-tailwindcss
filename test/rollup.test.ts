import configs from '../rollup.config'
import { rollup } from 'rollup'
describe('rollup build', () => {
  it('lib build', async () => {
    const result = []
    for (let i = 0; i < configs.length; i++) {
      const config = configs[i]

      result.push(await rollup({
        input: config.input,
        external: config.external,
        output: config.output,
        plugins: config.plugins
      }))
    }
    expect(result.length).toBe(configs.length)
  })
})
