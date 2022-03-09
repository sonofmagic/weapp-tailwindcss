# react-kbone

使用 react 多端开发(小程序和Web)，基于 [kbone](https://github.com/Tencent/kbone) 的 element 和 render。

## 特性

* 一键接入，立即使用
* 支持完整 JSX 语法，任意位置任意方式书写 JSX

## 一套语法多端运行

```jsx
function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <button onClick={() => setCount(count - 1)}>-</button>
      <span>{count}</span>
      <button onClick={() => setCount(count + 1)}>+</button>
      <div onClick={clickHandle}>跳转</div>
    </div>
  )
}

function clickHandle() {
  if ('undefined' != typeof wx && wx.getSystemInfoSync) {
    wx.navigateTo({
      url: '../log/index?id=1',
    })
  } else {
    location.href = 'log.html'
  }
}

export default Counter
```

## 快速开始

```
npx kbone-cli init my-app
cd my-app
npm run mp        // 开发小程序
npm run build:mp  // 构建小程序
npm run web       // 开发 web
npm run build     // 构建 web
```


## 目录说明

```
├─ dist
│  ├─ mp     // 微信开发者工具指向的目录，用于生产环境
│  ├─ web    // web 编译出的文件，用于生产环境
├─ build     // 构建相关
├─ src
│  ├─ assets
│  ├─ components     // 存放所有组件
│  ├─ log.jsx        // 入口文件，会 build 成 log.html
│  └─ index.jsx      // 入口文件，会 build 成 index.html
```

## 注意事项

react 并没有提供根组件实例的销毁方法（如 vue.$destroy），所以在多页应用中页面关闭时不会触发该页面组件的 componentWillUnmount 钩子。开发者可自行监听 wxunload 或 beforeunload 事件来进行页面的销毁工作，比如调用 render 方法渲染一个空节点，强行触发页面组件的 componentWillUnmount 钩子。

## 谁在使用 kbone？

<table>
	<tbody>
		<tr>
			<td>
        <a target="_blank" href="https://developers.weixin.qq.com/community/develop/mixflow">
          <img width="200px" src="https://raw.githubusercontent.com/wechat-miniprogram/kbone/develop/docs/images/code1.jpg">
        </a>
      </td>
			<td>
        <a target="_blank" href="http://omijs.org">
          <img width="200px" src="https://github.com/Tencent/omi/raw/master/assets/omi-cloud.jpg">
        </a>
      </td>
			<td width="92px">
        <a target="_blank" href="https://github.com/Tencent/omi/issues/new">告诉我们</a>
      </td>
    </tr>
  </tbody>
</table>

## License

MIT 
