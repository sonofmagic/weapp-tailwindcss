import './input.scss'
import join from 'lodash/join'
function component () {
  const element = document.createElement('div')

  // Lodash, currently included via a script, is required for this line to work
  element.innerHTML = `<h1 class="text-[60px] text-[#cccccc] m-[12px] h-[calc(100vh-100px)]">
  ${join(['Hello', 'webpack'], ' ')}
</h1>

<h2 class="text-clip bg-slate-100 text-left text-blue-200">weapp-tailwindcss-webpack-plugin</h2>
`

  return element
}

document.body.appendChild(component())
