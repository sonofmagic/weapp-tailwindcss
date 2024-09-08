import { createFilter } from '@/entry'
import klaw from 'klaw'
import mm from 'micromatch'
import path from 'pathe'

describe('klaw', () => {
  const viteNativeRoot = path.resolve(__dirname, '../../../apps/vite-native')
  it('vite-native packageA', async () => {
    // for await (const file of klaw(path.resolve(viteNativeRoot, 'packageA'))) {
    //   console.log(path.relative(viteNativeRoot, file.path))
    // }
    let res = mm.isMatch('D:\\github\\weapp-tailwindcss\\apps\\vite-native\\packageA\\index.js', ['packageA/**/*'], {
      cwd: 'D:\\github\\weapp-tailwindcss\\apps\\vite-native',
    })
    console.log(res)
    res = mm.isMatch(path.normalize('packageA/index.js'), ['packageA/**/*'], {
      cwd: path.normalize('D:\\github\\weapp-tailwindcss\\apps\\vite-native'),
    })
    console.log(res)
    const subPackageRoot = 'packageA'
    const include = [path.join(viteNativeRoot, subPackageRoot, '**/*')]
    const filter = createFilter(
      include,
      [
      ],
      { cwd: viteNativeRoot },
    )
    for await (const file of klaw(path.resolve(viteNativeRoot, 'packageA'), { filter })) {
      if (file.stats.isFile()) {
        console.log(path.relative(viteNativeRoot, file.path))
      }
    }
  })
})
