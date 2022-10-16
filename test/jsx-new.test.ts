import { jsxHandler as newJsxHandler } from '@/jsx/v2'

// import { jsxCasePath, createGetCase } from './util'

// const getCase = createGetCase(jsxCasePath)

// const putCase = createPutCase(jsxCasePath)

describe('jsxHandler', () => {
  // https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/53
  it('multiple file no end issue', async () => {
    const { code: code0 } = newJsxHandler(
      `_jsx(View, {
      className: 'border-[10px] border-[#098765] border-solid border-opacity-[0.44]'
    })`
    )
    expect(code0).toMatchSnapshot()
    const { code } = newJsxHandler(
      `import { replaceJs } from 'weapp-tailwindcss-webpack-plugin/replace'
    import './index.scss'
    import { jsx as _jsx } from 'react/jsx-runtime'
    import { jsxs as _jsxs } from 'react/jsx-runtime'
    import { Fragment as _Fragment } from 'react/jsx-runtime'`
    )
    expect(code).toMatchSnapshot()
  })
})
