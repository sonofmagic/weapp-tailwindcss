import Link from '@docusaurus/Link'
import Aizex from '@site/static/img/ads/aizex-mini.png'
import React, { useRef } from 'react'

function AdsContainerElement() {
  const containerRef = useRef<any>()

  return (
    <div ref={containerRef} className="px-4 space-y-4">
      <div className="flex items-center w-full dark:px-2">
        <div className="group relative">
          <div className="
          absolute hidden dark:block -inset-1 rounded-lg bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 opacity-75 blur transition duration-500 group-hover:opacity-100"
          >
          </div>
          <button className="relative rounded-lg dark:bg-black bg-[#f6f6f7] px-4 py-2 text-white font-semibold">
            <Link to="/docs/sponsor">成为赞助商</Link>
          </button>
        </div>
      </div>

      <a className="dark:bg-[#161618] hover:border-[#747bff] rounded-xl bg-[#f6f6f7] border-solid border-2 border-transparent text-xs text-center flex justify-between p-4" target="_blank" href="https://aizex.cn/0LcJ7G" rel="noopener sponsored nofollow">
        <div>
          <img className="w-20" src={Aizex} alt="aizex"></img>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-semibold">
            Aizex 合租面板
          </div>
          <div>
            更好用的「GPT-4 x 克劳德」使用方式
          </div>
          <div>
            亲测推荐!
          </div>
        </div>
        <div>
        </div>
      </a>
    </div>
  )
}

export default AdsContainerElement
