import process from 'node:process'

const isH5 = process.env.UNI_PLATFORM === 'h5'
const isApp = process.env.UNI_PLATFORM === 'app'
const WeappTailwindcssDisabled = isH5 || isApp
const isMp = !isH5 && !isApp

export {
  isApp,
  isH5,
  isMp,
  WeappTailwindcssDisabled,
}
