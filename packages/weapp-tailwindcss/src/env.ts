import process from 'node:process'

export const isProd = () => process.env.NODE_ENV === 'production'
export const isDev = () => process.env.NODE_ENV === 'development'
