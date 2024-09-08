export * from './projectConfig'
export * from './scan'

export const supportedCssLangs = ['wxss', 'scss', 'less', 'sass', 'styl']

export const supportedCssExtensions = supportedCssLangs.map(x => `.${x}`)
