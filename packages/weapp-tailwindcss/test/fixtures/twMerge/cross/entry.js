import { twMerge } from '@weapp-tailwindcss/merge'
import base, { buttonBase } from './shared'

const inline = 'bg-[#123456]'

export function render() {
  return twMerge(buttonBase, base, inline)
}
