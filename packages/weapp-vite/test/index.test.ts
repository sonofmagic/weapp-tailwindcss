import { createServer } from 'vite'
import plugin from '@/index'

describe('vite', () => {
  it('createServer', async () => {
    // const app = express()
    // app.listen()
    const SOCKET_PATH = '/tmp/weapp-vite.sock'

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
