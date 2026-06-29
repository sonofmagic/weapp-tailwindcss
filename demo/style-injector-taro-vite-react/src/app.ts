import './app.css'

if (process.env.TARO_ENV === 'h5') {
  import('./sub-normal/index.css')
  import('./sub-independent/index.css')
}

export default function App(props: { children: any }) {
  return props.children
}
