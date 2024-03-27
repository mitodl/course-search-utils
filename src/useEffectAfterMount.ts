import { useEffect, useState } from "react"

/**
 * Like `useEffect`, but only runs after component has rendered at least once.
 */
export function useEffectAfterMount(fn: () => void, deps: any[]): void {
  const [hasRendered, setHasRendered] = useState(false)

  useEffect(() => {
    if (hasRendered) {
      fn()
    } else {
      setHasRendered(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRendered, ...deps])
}
