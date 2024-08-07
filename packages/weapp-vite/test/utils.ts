import path from 'pathe'

export const appsDir = path.resolve(__dirname, '../../../apps')

export function getApp(app: string) {
  return path.resolve(appsDir, app)
}

export const dirs = [
  'native',
  'native-skyline',
  'native-ts',
  'native-ts-skyline',
  'vite-native',
  'vite-native-skyline',
  'vite-native-ts',
  'vite-native-ts-skyline',
]

export const absDirs = dirs.map((x) => {
  return {
    name: x,
    path: getApp(x),
  }
})
