import { useCallback, useEffect, useRef } from "react"
import { useSearchParams as useNextSearchParams } from "next/navigation"

type SearchParamsSetterValue =
  | URLSearchParams
  | ((prevSearchParams: URLSearchParams) => URLSearchParams)

type SetSearchParams = (newSearchParams: SearchParamsSetterValue) => void

/**
 * Returns a function for setting search params in the browser URL.
 *  - the first call within a single render cycle will add a new entry in the
 *   history stack via pushState
 *  - subsequent calls will replace the previous entry in the history stack
 *    and will receive the previously updated value in setter function
 *
 * NOTE: This is intended for use with NextJS, but could work with any framework
 * that supports direct usage of window.history.pushState / replaceState.
 */
const useSetSearchParams = (): SetSearchParams => {
  /**
   * Keep track of whether navigate has been called in the current render cycle
   * to avoid adding extra entries in the history stack.
   */
  const hasNavigatedRef = useRef(false)

  useEffect(() => {
    hasNavigatedRef.current = false
  })

  const setSearchParams: SetSearchParams = useCallback(nextValue => {
    const newParams =
      typeof nextValue === "function" ?
        nextValue(new URLSearchParams(window.location.search)) :
        nextValue

    if (hasNavigatedRef.current) {
      window.history.replaceState({}, "", `?${newParams}`)
    } else {
      window.history.pushState({}, "", `?${newParams}`)
    }

    hasNavigatedRef.current = true
  }, [])
  return setSearchParams
}

/**
 * Like react `useState`, but for getting/setting search params in NextJS
 * App Router. The setter is client-side only and will not trigger a call
 * to the server. (Uses `window.history.pushState` internally, not `useRouter`).
 *
 * ```ts
 * const [searchParams, setSearchParams] = useSearchParams();
 * ```
 * Where:
 * - `searchParams` is the search params objet from `next/navigation`'s useSearchParams
 * - `setSearchParams` is like React's `useState` setter:
 *    - arg can be a single value or function (current => next)
 *    - multiple synchronous calls to setSearchParams trigger only one pushState
 */
const useSearchParams = (): [URLSearchParams, SetSearchParams] => {
  return [useNextSearchParams(), useSetSearchParams()]
}

export default useSearchParams
