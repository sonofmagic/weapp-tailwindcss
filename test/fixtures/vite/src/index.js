import './index.css'

const className = 'w-[100px] h-[100px] ' + "bg-[url('https://xxx.com/xx.webp')]"

document.body.append(`<div class="${className}">className</div>`)

const el = document.createElement()

el.classList.add('w-[99px]', `h-[99px]`, "bg-[url('https://yyy.com/xx.webp')]")

document.body.appendChild(el)