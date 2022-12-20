declare module '*?resolve' {
  const PagePath: string
  export default PagePath
}

declare module '*?fallback=true' {
  const URL: string
  export default URL
}
