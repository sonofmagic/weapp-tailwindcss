//import './app.scss'
if (process.env.TARO_ENV !== 'rn') {
  require('./app.less')
}

const App = props => {
  return props.children
}
export default App
