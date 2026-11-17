export function createFrameThrottle (
  run: () => void,
  schedule: (cb: () => void) => number,
  cancel: (id: number) => void
) {
  let id: number | null = null
  return {
    request () {
      if (id !== null) return
      id = schedule(() => {
        id = null
        run()
      })
    },
    cancel () {
      if (id === null) return
      cancel(id)
      id = null
    },
  }
}
