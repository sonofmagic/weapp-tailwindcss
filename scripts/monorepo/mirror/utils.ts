import set from 'set-value'
import { chinaMirrorsEnvs } from './sources'

export function setMirror(obj: object) {
  const platforms = ['linux', 'windows', 'osx']
  const prefix = 'terminal.integrated.env'
  if (typeof obj === 'object' && obj) {
    for (const platform of platforms) {
      set(obj, [prefix, platform].join('.').replaceAll('.', '\\.'), chinaMirrorsEnvs)
    }
  }
}
