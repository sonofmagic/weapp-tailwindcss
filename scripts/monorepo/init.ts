import { createContext } from './context'
import setPkgJson from './setPkgJson'
import setReadme from './setReadme'

const ctx = await createContext()

await setPkgJson(ctx)
await setReadme(ctx)
