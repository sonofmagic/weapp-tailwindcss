import { Composition, Still } from 'remotion'
import { films, FORMATS, FPS } from './config'
import { PromoCover, PromoVideo } from './Video'
import './styles.css'

export function RemotionRoot() {
  return (
    <>
      {FORMATS.map((format) => {
        const film = films[format]
        return (
          <div key={format}>
            <Composition id={film.id} component={PromoVideo} fps={FPS} durationInFrames={film.seconds * FPS} width={film.width} height={film.height} defaultProps={{ format }} />
            <Still id={`${film.id}Cover`} component={PromoCover} width={film.width} height={film.height} defaultProps={{ format }} />
          </div>
        )
      })}
    </>
  )
}
