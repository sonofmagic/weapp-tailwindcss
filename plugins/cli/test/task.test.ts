import { getDefaultOptions } from '@/defaults'
import { getTasks } from '@/task'

describe('task', () => {
  it('get task case 0', async () => {
    // @ts-ignore
    const ctx = await getTasks(getDefaultOptions())

    expect(ctx.getCssTasks()?.length).toBe(4)
    expect(ctx.getHtmlTasks()?.length).toBe(1)
    expect(ctx.getJsTasks()?.length).toBe(3)
    expect(ctx.getJsonTasks()?.length).toBe(1)
    // expect(ctx.copyOthers())
  })

  it('get task case 1', async () => {
    // @ts-ignore
    const ctx = await getTasks({ ...getDefaultOptions(), typescriptOptions: true })

    expect(ctx.getCssTasks()?.length).toBe(4)
    expect(ctx.getHtmlTasks()?.length).toBe(1)
    expect(ctx.getJsTasks()?.length).toBe(3)
    expect(ctx.getJsonTasks()?.length).toBe(1)
    // expect(ctx.copyOthers())
  })
})
