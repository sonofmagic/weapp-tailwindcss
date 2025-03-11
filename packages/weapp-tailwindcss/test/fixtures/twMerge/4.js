const obj = {
  a: 'px-[35px]',
  b: {
    c: 'px-[35px]'
  },
  d: ['px-[35px]']
}

const arr = ['px-[35px]']

clsx('px-[35px]', obj.a, obj.b.c, obj.d[0], arr[0]);