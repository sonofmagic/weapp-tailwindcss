import React from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

const rows = [
  'bg-amber-300 text-zinc-900',
  'bg-green-300 text-zinc-900',
  'bg-blue-300 text-zinc-900',
  'bg-pink-300 text-zinc-900',
]

function App() {
  return (
    <main className="min-h-screen bg-zinc-50 p-6 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50">
      <section className="mx-auto grid max-w-4xl gap-6">
        <div className="rounded border border-zinc-900/10 bg-white p-5 shadow-[0_8rpx_24rpx_rgba(0,0,0,0.12)] dark:bg-zinc-900">
          <h1 className="text-[32rpx] font-semibold">React Vite Tailwind CSS v4</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Web target is the default. Use build:weapp to compare mini-program CSS output.
          </p>
          <div className="theme-mode-demo mt-4 rounded bg-white px-4 py-3 text-slate-900 system-dark:bg-slate-900 system-dark:text-slate-100 dark:bg-zinc-900 dark:text-zinc-50">
            React Vite Tailwind CSS v4 system dark
            <div className="theme-dark mt-2 rounded bg-white px-3 py-2 text-slate-900 dark:bg-zinc-950 dark:text-zinc-50">
              React Vite Tailwind CSS v4 manual dark
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-[16rpx] md:grid-cols-4">
          {rows.map(item => (
            <div key={item} className={`${item} rounded p-[24rpx] text-center before:mr-1 before:content-['v4']`}>
              swatch
            </div>
          ))}
        </div>
        <div className="-mt-1.5 grid grid-cols-2 gap-3.5 rounded-[18.5px] border border-dashed border-[#336699]/40 bg-[linear-gradient(135deg,#f8fafc_0%,#dbeafe_100%)] !p-[18.5px]">
          <div className="!-translate-y-[3.5px] -rotate-2 bg-[#123456] px-[13.5px] py-1.5 text-[13.5px] text-white shadow-[0_2.5px_7.5px_rgba(18,52,86,0.35)]">
            arbitrary
          </div>
          <div className="!mt-0 -ml-[5.5px] w-[37.5%] min-w-[88.5px] scale-[1.03] bg-[rgb(255,210,55)] text-center text-[#1f2937] opacity-[0.82]">
            decimal
          </div>
        </div>
        <button className="w-fit rounded bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-300 active:bg-green-300">
          compare
        </button>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
