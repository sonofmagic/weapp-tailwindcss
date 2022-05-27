import { Component } from 'react'

export default class Index extends Component {
  componentDidMount() {
    debugger
    console.log('componentDidMount')
  }
  componentDidUpdate() {
    debugger
    console.log('componentDidUpdate')
  }
  render() {
    const text = 'debugger'
    // 此处写可以准确触发
    // debugger
    return text
  }
}
