import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import {
  addComponents,
  DEFAULT_FRAMEWORK,
  defaultRegistry,
  loadWetwConfig,
  resolveRegistry,
  writeDefaultConfig,
} from '@/index'

const createTempDir = () => mkdtemp(path.join(tmpdir(), 'wetw-'))

describe('wetw cli core', () => {
  it('loads defaults when no config file is present', async () => {
    const cwd = await createTempDir()
    const config = await loadWetwConfig({ cwd })

    expect(config.cwd).toBe(cwd)
    expect(config.outDir).toBe(path.resolve(cwd, 'wetw'))
    expect(config.registry).toEqual(defaultRegistry)
    expect(config.framework).toBe(DEFAULT_FRAMEWORK)
  })

  it('creates a default wetw.config.ts', async () => {
    const cwd = await createTempDir()
    const file = await writeDefaultConfig({ cwd })
    const content = await readFile(file, 'utf8')

    expect(file).toBe(path.join(cwd, 'wetw.config.ts'))
    expect(content).toContain('defineConfig')
    expect(content).toContain('outDir: \'wetw\'')
  })

  it('adds a registry component into the outDir', async () => {
    const cwd = await createTempDir()
    const result = await addComponents(['counter'], { cwd, force: true })
    const json = await readFile(path.join(cwd, 'wetw/counter/mp-weixin/index.json'), 'utf8')

    expect(result.added).toEqual(['counter'])
    expect(JSON.parse(json).component).toBe(true)
  })

  it('throws when target file exists without force', async () => {
    const cwd = await createTempDir()
    const target = path.join(cwd, 'wetw/counter/mp-weixin/index.ts')
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, '// existing')

    await expect(addComponents(['counter'], { cwd })).rejects.toThrow(/already exists/i)
  })

  it('supports loading registry from a local json file', async () => {
    const cwd = await createTempDir()
    const registryPath = path.join(cwd, 'registry.json')
    const registry = [
      {
        name: 'stub',
        description: 'custom',
        frameworks: {
          'uni-app-vue3': [
            { path: 'stub/uni-app-vue3.vue', content: '<template><view>uni</view></template>' },
          ],
          'mp-weixin': [
            { path: 'stub/mp-weixin/index.ts', content: 'Component({})' },
          ],
        },
      },
    ]
    await writeFile(registryPath, JSON.stringify(registry), 'utf8')

    const config = await loadWetwConfig({
      cwd,
      overrides: { registry: registryPath, framework: 'uni-app-vue3' },
    })
    const resolved = await resolveRegistry(config)
    expect(resolved[0]?.name).toBe('stub')

    await addComponents(['stub'], {
      cwd,
      registry: resolved,
      force: true,
      overrides: { framework: 'uni-app-vue3' },
    })
    const content = await readFile(path.join(cwd, 'wetw/stub/uni-app-vue3.vue'), 'utf8')
    expect(content).toContain('uni')
  })
})
