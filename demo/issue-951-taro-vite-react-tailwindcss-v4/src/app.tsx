import './app.css'

if (process.env.TARO_ENV === 'h5') {
  void import('./sub-normal/index.css')
  void import('./sub-independent/index.css')
}

export default function App(props: { children?: React.ReactNode }) {
  return props.children
}
