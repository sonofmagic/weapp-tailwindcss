// @ts-ignore
const x = import.meta.env.isDev

console.log('--------packageB----------', x ?? 'ss')
