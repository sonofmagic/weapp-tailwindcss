export default {
  '::view-transition-old(root),\n  ::view-transition-new(root)': {
    mixBlendMode: 'normal',
    animation: 'none',
  },
  '::view-transition-old(root)': {
    zIndex: 1,
  },
  '::view-transition-new(root)': {
    zIndex: 2147483646,
  },
  '.dark::view-transition-old(root)': {
    zIndex: 2147483646,
  },
  '.dark::view-transition-new(root)': {
    zIndex: 1,
  },
}
