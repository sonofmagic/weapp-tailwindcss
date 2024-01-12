declare function plugin(options?: Partial<{ className: string; target: 'modern' | 'legacy'; prefix: string }>): {
  handler: () => void
}

declare namespace plugin {
  const __isOptionsFunction: true
}

export = plugin
