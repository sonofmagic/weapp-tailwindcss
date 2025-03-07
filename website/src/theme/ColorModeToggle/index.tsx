import type { Props } from '@theme/ColorModeToggle'
import OriginalToggle from '@theme-original/ColorModeToggle'
import { useToggleTheme } from 'theme-transition'

// light -> dark, props.value === light
// dark -> light, props.value === dark
function Toggler(props: Props) {
  const { toggleTheme } = useToggleTheme({
    isCurrentDark() {
      return props.value !== 'dark'
    },
    toggle() {
      if (props.value === 'dark') {
        props.onChange('light')
      }
      else {
        props.onChange('dark')
      }
    },
  })
  return (
    <div onClick={(e) => {
      toggleTheme(e)
    }}
    >
      <OriginalToggle
        {...props}
        onChange={() => {}}
      >
      </OriginalToggle>
    </div>

  )
}

export default Toggler
