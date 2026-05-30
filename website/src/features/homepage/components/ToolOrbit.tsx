import type { ComponentType, FC, SVGProps } from 'react'
import { toolOrbit, toolOrbitCore, toolOrbitItem, toolOrbitLabel } from '../variants'

export type ToolOrbitPlacement = 'webpack' | 'vite' | 'gulp' | 'node'

export interface ToolOrbitItemConfig {
  placement: ToolOrbitPlacement
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

export interface ToolOrbitProps {
  items: ToolOrbitItemConfig[]
}

export const ToolOrbit: FC<ToolOrbitProps> = ({ items }) => {
  return (
    <div className={toolOrbit()}>
      {items.map(({ placement, label, Icon }) => (
        <div key={placement} className={toolOrbitItem({ placement })}>
          <Icon className={`
            size-8
            md:size-9
          `}
          />
          <span className={toolOrbitLabel()}>{label}</span>
        </div>
      ))}
      <div className={toolOrbitCore()}>
        <span>Build</span>
        <span>Matrix</span>
      </div>
    </div>
  )
}
