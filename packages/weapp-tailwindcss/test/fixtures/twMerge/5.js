const obj = {
  a: 'px-[35px]',
  b: {
    c: 'px-[35px]'
  },
  d: arr
}

const arr = ['px-[35px]', obj]

clsx('px-[35px]', obj.a, obj.b.c, obj.d[0], arr[0]);