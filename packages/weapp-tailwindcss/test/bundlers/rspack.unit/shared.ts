export function getUseLoaders(config: any) {
  return config.module.rules[0].oneOf[0].use.map((item: any) => item.loader)
}
