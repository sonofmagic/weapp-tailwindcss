import { Composition, Still } from 'remotion'
import { defaultPromoProps, VIDEO } from './config'
import { LynxPromo } from './video/LynxPromo'
import { LynxPromoCover } from './video/LynxPromoCover'

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="LynxPromo"
        component={LynxPromo}
        durationInFrames={VIDEO.durationInFrames}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={defaultPromoProps}
      />
      <Still
        id="LynxPromoCover"
        component={LynxPromoCover}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={defaultPromoProps}
      />
    </>
  )
}
