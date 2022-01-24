// import './input.css'
import join from 'lodash/join'
function component () {
  const element = document.createElement('div')

  // Lodash, currently included via a script, is required for this line to work
  element.innerHTML = `<h1 class="text-3xl font-bold underline">
  ${join(['Hello', 'webpack'], ' ')}
</h1>`

  return element
}

document.body.appendChild(component())
