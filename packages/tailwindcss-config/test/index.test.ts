import path from 'pathe'
import { loadConfig } from '@/index'

const fixturesDir = path.resolve(import.meta.dirname, './fixtures')

vi.mock(import('@/index'), async (importOriginal) => {
  const { loadConfig: _loadConfig } = await importOriginal()

  function loadConfig(...args: Parameters<typeof _loadConfig>) {
    return _loadConfig(...args).then((x) => {
      if (x && 'filepath' in x) {
        // @ts-ignore
        delete x.filepath
      }
      return x
    })
  }

  return {
    loadConfig,
  }
})

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
