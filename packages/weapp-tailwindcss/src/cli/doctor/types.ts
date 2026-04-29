export type DoctorCheckStatus = 'ok' | 'warn' | 'error' | 'info'

export interface DoctorCheck {
  id: string
  title: string
  status: DoctorCheckStatus
  message: string
  suggestion?: string
}

export interface DoctorReport {
  cwd: string
  nodeVersion: string
  detected: {
    packageManager?: string
    frameworks: string[]
    tailwindcssVersion?: string
    weappTailwindcssVersion?: string
  }
  summary: Record<DoctorCheckStatus, number>
  checks: DoctorCheck[]
}

export interface DoctorOptions {
  cwd?: string
  nodeVersion?: string
}

export interface PackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  packageManager?: string
}
