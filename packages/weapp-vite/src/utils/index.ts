export * from './scan'
export * from './projectConfig'

export const supportedCssLangs = ['wxss', 'scss', 'less', 'sass', 'styl']

export const supportedCssExtensions = supportedCssLangs.map(x => `.${x}`)
