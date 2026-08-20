export interface AndroidWindowTap {
  x: number
  y: number
}

function getNodeAttributes(node: string) {
  const attributes = new Map<string, string>()
  for (const match of node.matchAll(/([\w:-]+)="([^"]*)"/g)) {
    attributes.set(match[1], match[2])
  }
  return attributes
}

function getNodeBounds(node: string): AndroidWindowTap | undefined {
  const bounds = getNodeAttributes(node).get('bounds')?.match(/^\[(\d+),(\d+)\]\[(\d+),(\d+)\]$/)
  if (!bounds) {
    return
  }
  const [, left, top, right, bottom] = bounds.map(Number)
  if (right <= left || bottom <= top) {
    return
  }
  return {
    x: Math.floor((left + right) / 2),
    y: Math.floor((top + bottom) / 2),
  }
}

export function findAndroidAnrWaitTap(windowXml: string): AndroidWindowTap | undefined {
  const nodes = [...windowXml.matchAll(/<node\b[^>]*>/g)].map(match => match[0])
  const resourceIds = new Set(nodes.map(node => getNodeAttributes(node).get('resource-id')))
  if (!resourceIds.has('android:id/aerr_close') || !resourceIds.has('android:id/aerr_wait')) {
    return
  }
  const waitNode = nodes.find(node => getNodeAttributes(node).get('resource-id') === 'android:id/aerr_wait')
  return waitNode ? getNodeBounds(waitNode) : undefined
}
