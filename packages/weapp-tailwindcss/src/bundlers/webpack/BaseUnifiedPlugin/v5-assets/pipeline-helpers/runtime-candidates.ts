export function isRuntimeTransformCandidate(candidate: string) {
  return candidate.length > 0
    && !candidate.includes('=')
    && !candidate.includes('<')
    && !candidate.includes('>')
    && !candidate.includes('${')
}
