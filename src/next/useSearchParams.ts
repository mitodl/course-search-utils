import { useCallback, useEffect, useMemo, useRef } from "react"
import { usePathname, useSearchParams as useNextSearchParams, useRouter } from "next/navigation"

type SearchParamsSetterValue =
  | URLSearchParams
  | ((prevSearchParams: URLSearchParams) => URLSearchParams)

type SetSearchParams = (newSearchParams: SearchParamsSetterValue) => void

/**
 * A hook for getting and setting URL Search Parameters with React Router.
 *
 * NOTE: React Router v6 has a built-in hook for this, but it has an issue with
 * multiple updates.
 *
 * With React's own `useState` hook, updater functions are passed the CURRENT
 * value. For example:
 * ```ts
 * const [count, setCount] = useState(0)
 * const incrementBy2 = () => {
 *    setCount((prevCount) => prevCount + 1)
 *    setCount((prevCount) => prevCount + 1)
 * }
 * ```
 * Calling `incrementBy2` will increment `count` by 2: the second call to
 * `setCount` will use the updated value from the first call.
 *
 * React Router's own `useSearchParams` hook does not have this behavior: it
 * uses outdated values when multiple updates occur in a row. This inhibits
 * the ability independently update multiple search params in a single render
 * cycle.
 */
const useSearchParams = (): [URLSearchParams, SetSearchParams] => {
  const pathname = usePathname()
  const router = useRouter()
  const search = useNextSearchParams()

  /**
   * Keep track of whether navigate has been called in the current render cycle
   * to avoid adding extra entries in the history stack.
   */
  const hasNavigatedRef = useRef(false)
  const searchParams = useMemo(() => new URLSearchParams(search), [search])
  /**
   * Keep track of the current searchParams value so that updater functions can
   * use the current value rather than value from previous render.
   */
  const searchParamsRef = useRef(searchParams)

  useEffect(() => {
    hasNavigatedRef.current = false
    /**
     * Each render, sync the ref with the current state value.
     * This is necessary in case search params has changed via some source other
     * than this hook (e.g., browser navigation).
     */
    searchParamsRef.current = searchParams
  })

  const setSearchParams: SetSearchParams = useCallback(
    nextValue => {
      const newParams =
        typeof nextValue === "function" ?
          nextValue(searchParamsRef.current) :
          nextValue

      searchParamsRef.current = newParams

      if (hasNavigatedRef.current) {
        router.replace(`${pathname}?${newParams}`)
      } else {
        router.push(`${pathname}?${newParams}`)
      }

      hasNavigatedRef.current = true
    },
    [pathname, router]
  )
  return [searchParams, setSearchParams]
}

export default useSearchParams
