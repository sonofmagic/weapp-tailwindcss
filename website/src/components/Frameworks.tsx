import React, { useEffect, useRef } from 'react'
import weappLogo from '@site/src/assets/weapp.png'
import mpxLogo from '@site/src/assets/mpx.png'
import taroLogo from '@site/src/assets/taro.png'
import uniAppLogo from '@site/src/assets/uni-app.png'
import raxLogo from '@site/src/assets/rax.png'
import saveAs from 'file-saver'
import { fabric } from './fabric'

export default function Frameworks() {
  const height = 250
  const width = 300
  const canvasRef = useRef<fabric.Canvas>()
  const canvasElRef = useRef<HTMLCanvasElement>()
  useEffect(() => {
    if (!fabric) {
      return
    }
    canvasRef.current = new fabric.Canvas(canvasElRef.current)
    // const ctx = canvasElRef.current.getContext('2d')

    const canvas = canvasRef.current
    fabric.Image.fromURL(weappLogo, (oImg) => {
      oImg.scale(0.18)
      oImg.set({
        left: 10,
        top: 10,
      })
      canvas.add(oImg)
    })

    fabric.Image.fromURL(mpxLogo, (oImg) => {
      oImg.scale(0.25)
      oImg.set({
        left: 10,
        top: 160,
      })
      // oImg.animate('angle', 45, { onChange: canvas.renderAll.bind(canvas), duration: 1000, easing: fabric.util.ease.easeOutBounce })
      canvas.add(oImg)
    })

    fabric.Image.fromURL(taroLogo, (oImg) => {
      oImg.scale(0.5)
      oImg.set({
        left: 150,
        top: 20,
      })
      canvas.add(oImg)
    })

    fabric.Image.fromURL(uniAppLogo, (oImg) => {
      oImg.scale(0.65)
      oImg.set({
        left: 100,
        top: 100,
      })
      canvas.add(oImg)
    })

    fabric.Image.fromURL(raxLogo, (oImg) => {
      oImg.scale(0.5)
      oImg.set({
        left: 200,
        top: 150,
      })
      canvas.add(oImg)
    })

    return () => {
      // canvasRef.current.dispose()
    }
  })
  return (
    <div className="flex flex-col items-center">
      <h3>主流框架支持，还有原生开发</h3>
      <div>
        <canvas className="rounded border border-dashed border-sky-500" ref={canvasElRef} width={width} height={height}></canvas>
      </div>
      <button
        className="mt-2"
        onClick={() => {
          canvasElRef.current.toBlob((blob) => {
            saveAs(blob, 'weapp-tw-frameworks.png')
          })
        }}
      >
        download
      </button>
    </div>
  )
}
