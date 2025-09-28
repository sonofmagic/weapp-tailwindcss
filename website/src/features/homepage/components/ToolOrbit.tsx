import type { ComponentType, FC, SVGProps } from 'react'
import { toolOrbit, toolOrbitCore, toolOrbitItem, toolOrbitLabel, toolOrbitRing } from '../variants'

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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-20%] -z-10 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.28),transparent_60%)] opacity-40 blur-[50px]"
      >
      </div>
      <div className={toolOrbitRing({ className: 'z-0' })}></div>
      <div className={toolOrbitRing({ variant: 'inner', className: 'z-0' })}></div>
      {items.map(({ placement, label, Icon }) => (
        <div key={placement} className={toolOrbitItem({ placement })}>
          <Icon className="size-10 drop-shadow-[0_6px_12px_rgba(15,23,42,0.15)] md:size-11" />
          <span className={toolOrbitLabel()}>{label}</span>
        </div>
      ))}
      <div className={toolOrbitCore()}>
        <span>Unified</span>
        <span>Pipeline</span>
      </div>
    </div>
  )
}
