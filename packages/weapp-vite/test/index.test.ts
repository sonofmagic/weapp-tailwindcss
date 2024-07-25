import os from 'node:os'
import path from 'node:path'
import { createServer } from 'vite'
import fs from 'fs-extra'
import plugin from '@/index'

describe('vite', () => {
  it('createServer', async () => {
    // const app = express()
    // app.listen()
    const tmpdir = os.tmpdir()
    console.log(`[weapp vite] tmpdir: ${tmpdir}`)
    // × vite > createServer
    //  → listen EACCES: permission denied /tmp/weapp-vite.sock
    const SOCKET_PATH = path.resolve(tmpdir, 'weapp-vite.sock') // '/tmp/'
    fs.ensureFileSync(SOCKET_PATH)
    const server = await createServer(
      {
        configFile: false,
        server: {

        },
        plugins: [plugin()],
      },
    )
    // @ts-ignore
    await server.listen(SOCKET_PATH)

    server.close()
  })
})
