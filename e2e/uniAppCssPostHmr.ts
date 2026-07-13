import path from 'pathe'

export interface UniAppCssPostHmrCase {
  name: string
  platform: 'mp-alipay' | 'mp-weixin'
  projectRoot: string
  devScript: string
  sourceFile: string
  outputStyleFile: string
  generatedStyleFile: string
}

const styleExtensions = {
  'mp-alipay': 'acss',
  'mp-weixin': 'wxss',
} as const

export function createUniAppCssPostHmrCases(repositoryRoot: string): UniAppCssPostHmrCase[] {
  const project = 'issue-uview-plus-cssentries'
  const projectRoot = path.resolve(repositoryRoot, `demo/${project}`)
  return (['mp-weixin', 'mp-alipay'] as const).map((platform) => {
    const extension = styleExtensions[platform]
    const outputRoot = path.resolve(projectRoot, `dist/dev/${platform}`)
    return {
      name: `${project}:${platform}`,
      platform,
      projectRoot,
      devScript: `dev:${platform}`,
      sourceFile: path.resolve(projectRoot, 'src/pages/demonstration/index.vue'),
      outputStyleFile: path.resolve(outputRoot, `pages/demonstration/index.${extension}`),
      generatedStyleFile: path.resolve(outputRoot, `styles/tailwindcss.${extension}`),
    }
  })
}
