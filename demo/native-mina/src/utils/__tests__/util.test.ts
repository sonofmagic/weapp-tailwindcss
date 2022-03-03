import { values } from '../util'
describe('values', () => {
  it('can use values method of array', () => {
    const array = values(['x', 'y'])

    for (let i of array) {
      expect(['x', 'y']).toContain(i)
    }
  })
})
