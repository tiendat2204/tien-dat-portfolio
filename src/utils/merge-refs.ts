import type { Ref, RefCallback } from 'react'

export function mergeRefs<T> (...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (value) => {
    for (const ref of refs) {
      if (!ref) continue

      if (typeof ref === 'function') {
        ref(value)
      } else {
        (ref as { current: T | null }).current = value
      }
    }
  }
}
