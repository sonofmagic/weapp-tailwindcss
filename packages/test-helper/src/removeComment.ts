import type { Plugin } from 'postcss'

export const postcssRemoveComment: Plugin = {
  Comment(comment, _helper) {
    comment.remove()
  },
  postcssPlugin: 'remove-all-comment',
}
