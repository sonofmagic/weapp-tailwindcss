import { create } from '@weapp-tailwindcss/merge'
import { useState } from 'react'

export function MergeDemo() {
  const [disableEscape, setDisableEscape] = useState(false)
  const { twMerge } = create(
    {
      disableEscape,
    },
  )
  const x = twMerge('px-2 py-1 bg-red hover:bg-dark-red', 'p-3 bg-[#B91C1C]')

  return (
    <div>
      <div className="flex space-x-3">
        <div>
          参数 disableEscape:
          {String(disableEscape)}
        </div>
        <div>
          <button onClick={() => setDisableEscape(!disableEscape)}>点我切换参数</button>
        </div>
      </div>
      <div className="space-x-3">
        <span>结果:</span>
        <span>{x}</span>
      </div>
    </div>
  )
}
