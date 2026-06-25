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
  '[data-theme-transition="to-dark"]::view-transition-old(root)': {
    zIndex: 1,
  },
  '[data-theme-transition="to-dark"]::view-transition-new(root)': {
    clipPath: 'circle(0px at var(--theme-transition-x) var(--theme-transition-y))',
    zIndex: 2147483646,
  },
  '[data-theme-transition="from-dark"]::view-transition-old(root)': {
    clipPath: 'circle(var(--theme-transition-radius) at var(--theme-transition-x) var(--theme-transition-y))',
    zIndex: 2147483646,
  },
  '[data-theme-transition="from-dark"]::view-transition-new(root)': {
    zIndex: 1,
  },
}
