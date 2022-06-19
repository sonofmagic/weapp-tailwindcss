const fs = require('fs')
const path = require('path')

const typeOutputPath = path.resolve(__dirname, '../types')

;[path.resolve(typeOutputPath, './base/BaseJsxPlugin/v4.d.ts'), path.resolve(typeOutputPath, './base/BaseTemplatePlugin/v4.d.ts')].forEach((p) => {
  fs.writeFileSync(
    p,
    fs
      .readFileSync(p, {
        encoding: 'utf8'
      })
      .replace(/webpack4/g, 'webpack'),
    {
      encoding: 'utf-8'
    }
  )
})

const vitePath = path.resolve(typeOutputPath, './framework/vite/index.d.ts')

fs.writeFileSync(
  vitePath,
  fs
    .readFileSync(vitePath, {
      encoding: 'utf8'
    })
    .replace('../../../node_modules/vite', 'vite'),
  {
    encoding: 'utf-8'
  }
)
;[path.resolve(typeOutputPath, './postcss/mp.d.ts'), path.resolve(typeOutputPath, './postcss/plugin.d.ts')].forEach((p) => {
  fs.writeFileSync(
    p,
    fs
      .readFileSync(p, {
        encoding: 'utf8'
      })
      .replace('../../node_modules/postcss', 'postcss'),
    {
      encoding: 'utf-8'
    }
  )
})
