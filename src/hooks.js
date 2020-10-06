import { useEffect, useRef } from "react"

export function useDidMountEffect(fn, deps) {
  const renderedOnce = useRef(false)

  useEffect(() => {
    if (renderedOnce.current) {
      fn()
    } else {
      renderedOnce.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
