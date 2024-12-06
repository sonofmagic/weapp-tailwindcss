import { loadConfig } from '@/index'
import path from 'pathe'

const fixturesDir = path.resolve(import.meta.dirname, './fixtures')

describe('index', () => {
  it('cwd', async () => {
    expect(await loadConfig({
      cwd: path.resolve(fixturesDir, './cwd'),
    })).toMatchSnapshot()
  })

  it('cjs', async () => {
    expect(await loadConfig({
      cwd: path.resolve(fixturesDir, './cjs'),
    })).toMatchSnapshot()
  })

  it('js', async () => {
    expect(await loadConfig({
      cwd: path.resolve(fixturesDir, './js'),
    })).toMatchSnapshot()
  })

  it('ts', async () => {
    expect(await loadConfig({
      cwd: path.resolve(fixturesDir, './ts'),
    })).toMatchSnapshot()
  })

  it('mjs', async () => {
    expect(await loadConfig({
      cwd: path.resolve(fixturesDir, './mjs'),
    })).toMatchSnapshot()
  })
})
