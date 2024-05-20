import React from 'react'
// import WeappIcon from '@site/src/assets/weapp.svg'
// import TwLogoIcon from '@site/src/assets/tw-logo.svg'
// import TwLogoIcon from '@site/static/img/logo.png'
// import LinkIcon from '@site/src/assets/link.svg'
import TwLogoIcon from '@site/../assets/logo.svg'

export default function HomeLogo() {
  return (
    <div className="flex items-center justify-center">
      <TwLogoIcon></TwLogoIcon>
      {/* <img src={TwLogoIcon} className="dark:text-white" alt="weapp-tailwindcss"></img> */}
      {/* <TwLogoIcon className="dark:text-white"></TwLogoIcon>
      <LinkIcon className="w-12 mx-4 dark:text-white"></LinkIcon>
      <WeappIcon className="w-24"></WeappIcon> */}
    </div>
  )
}
