import React, { useEffect, useRef } from 'react'
import type { PropsWithChildren } from 'react'
import gulpLogo from '@site/src/assets/gulp.png'
import webpackLogo from '@site/src/assets/webpack.png'
import viteLogo from '@site/src/assets/vite.png'
import { saveAs } from 'file-saver'
import { fabric } from './fabric'

export default function Plugins(props: PropsWithChildren<{}>) {
  const height = 250
  const width = 250
  const canvasRef = useRef<fabric.Canvas>()
  const canvasElRef = useRef<HTMLCanvasElement>()
  useEffect(() => {
    if (!fabric) {
      return
    }
    canvasRef.current = new fabric.Canvas(canvasElRef.current)
    const canvas = canvasRef.current
    fabric.Image.fromURL(webpackLogo, (oImg) => {
      oImg.scale(0.03)
      oImg.set({
        left: 10,
        top: 10,
      })
      canvas.add(oImg)
    })

    fabric.Image.fromURL(viteLogo, (oImg) => {
      oImg.scale(0.2)
      oImg.set({
        left: 10,
        top: 110,
      })
      // oImg.animate('angle', 45, { onChange: canvas.renderAll.bind(canvas), duration: 1000, easing: fabric.util.ease.easeOutBounce })
      canvas.add(oImg)
    })

    fabric.Image.fromURL(gulpLogo, (oImg) => {
      oImg.scale(0.3)
      oImg.set({
        left: 160,
        top: 50,
      })
      canvas.add(oImg)
    })

    return () => {
      // canvasRef.current.dispose()
    }
  })
  return (
    <div className="flex flex-col items-center">
      <h3>not only webpack vite gulp and more </h3>
      <div>
        <canvas className="rounded border border-dashed border-sky-500" ref={canvasElRef} width={width} height={height}></canvas>
      </div>
      <button
        className="mt-2"
        onClick={() => {
          canvasElRef.current.toBlob((blob) => {
            saveAs(blob, 'weapp-tw-plugins.png')
          })
        }}
      >
        download
      </button>
      {/* <div>Plugins</div> */}
    </div>
  )
}
