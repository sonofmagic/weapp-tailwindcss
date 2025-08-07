import type { AcceptedPlugin } from 'postcss'

export const postcssRemoveComment: AcceptedPlugin = {
  Comment(comment, _helper) {
    comment.remove()
  },
  postcssPlugin: 'remove-all-comment',
}
