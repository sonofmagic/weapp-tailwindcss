import type { Props } from '@theme/ColorModeToggle'
import OriginalToggle from '@theme-original/ColorModeToggle'
import { useToggleDark } from 'theme-transition'

function Toggler(props: Props) {
  const { toggleDark } = useToggleDark({
    getDarkValue() {
      return props.value === 'dark'
    },
    toggle() {
      if (props.value === 'dark') {
        props.onChange('light')
      }
      else {
        props.onChange('dark')
      }
    },
    viewTransition: {
      after() {
        return new Promise((r) => {
          setTimeout(() => {
            r(undefined)
          }, 0)
        })
      },
    },
    duration: 4000,
  })
  return (
    <div onClick={(e) => {
      toggleDark(e as unknown as MouseEvent)
    }}
    >
      <OriginalToggle
        {...props}
        onChange={() => {
          // props.onChange(colorMode)
          // toggleDark()
        }}
      >
      </OriginalToggle>
    </div>

  )
}

export default Toggler
