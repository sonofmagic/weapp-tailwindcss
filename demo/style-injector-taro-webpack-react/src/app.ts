import './app.css'

if (process.env.TARO_ENV === 'h5') {
  require('./sub-normal/index.css')
  require('./sub-independent/index.css')
}

export default function App(props: { children: any }) {
  return props.children
}
