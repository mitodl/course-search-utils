import { contentSearchValidators, resourceSearchValidators } from "./validation"
import type { QueryParamValidators } from "./validation"
import type {
  LearningResourcesSearchApiLearningResourcesSearchRetrieveRequest as ResourceSearchRequest,
  ContentFileSearchApiContentFileSearchRetrieveRequest as ContentFileSearchRequest
} from "../open_api_generated"
import { useCallback, useMemo, useState } from "react"

interface UseValidatedSearchParamsProps<ReqParams> {
  /**
   * Source of truth for search parameters.
   *
   * Note: React should be aware of the state of this object. For example,
   * do NOT pass `new UrlSearchParams(window.location.search)` directly.
   * Instead, use `useSearchParams` hook from `react-router-dom` or equivalent.
   */
  searchParams: URLSearchParams
  /**
   * A setter for `searchParams`.
   */
  setSearchParams: (
    value: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams)
  ) => void
  /**
   * Array of request parameter keys that are considered facets.
   * Determs when to call `onFacetsChange` callback and which params are reset
   * via clearAllFacets.
   */
  facets?: (keyof ReqParams & string)[]
  onFacetsChange?: () => void
}

interface UseValidatedSearchParamsResult<ReqParams> {
  /**
   * Valdiated search request parameters.
   */
  params: ReqParams
  /**
   * Clear all parameters marked as facets.
   */
  clearAllFacets: () => void
  /**
   * Clear a particle parameter by key.
   */
  clearParam: (key: keyof ReqParams & string) => void
  /**
   * Patch the request parameters.
   * - missing keys are ignored
   * - null or empty values are removed
   * - all other values are set (NOT appended).
   */
  patchParams: (patch: Partial<ReqParams>) => void
  /**
   * Toggle a parameter value on or off.
   * - if `checked=true`, value is APPENDED to parameter list.
   * - if `checked=false`, value is REMOVED from parameter list.
   */
  toggleParamValue: (name: string, rawValue: string, checked: boolean) => void
  /**
   * Current search text. May be different from the `q` parameter.
   */
  currentText: string
  /**
   * Set current text.
   */
  setCurrentText: (value: string) => void
  /**
   * Set current text and update the `q` parameter.
   */
  setCurrentTextAndQuery: (value: string) => void
}

const useValidatedSearchParams = <ReqParams>({
  searchParams,
  setSearchParams,
  facets = [],
  validators,
  onFacetsChange
}: UseValidatedSearchParamsProps<ReqParams> & {
  validators: QueryParamValidators<ReqParams>
}): UseValidatedSearchParamsResult<ReqParams> => {
  const params = useMemo(() => {
    return Object.keys(validators).reduce((acc, key) => {
      const validator = validators[key as keyof ReqParams]
      const values = searchParams.getAll(key)
      const validated = validator(values)
      if (!validated || (Array.isArray(validated) && validated.length === 0)) {
        return acc
      }
      return { ...acc, [key]: validated }
    }, {} as ReqParams)
  }, [searchParams, validators])
  const clearAllFacets = useCallback(() => {
    setSearchParams(current => {
      const copy = new URLSearchParams(current)
      facets.forEach(f => copy.delete(f))
      copy.sort()
      return copy
    })
    onFacetsChange?.()
  }, [facets, setSearchParams, onFacetsChange])
  const clearParam = useCallback(
    (key: keyof ReqParams & string) => {
      setSearchParams(current => {
        const copy = new URLSearchParams(current)
        copy.delete(key)
        copy.sort()
        return copy
      })
      if ((facets as string[]).includes(key)) {
        onFacetsChange?.()
      }
    },
    [setSearchParams, onFacetsChange, facets]
  )
  const patchParams = useCallback(
    (patch: Partial<ReqParams>) => {
      setSearchParams(current => {
        const copy = new URLSearchParams(current)
        Object.entries(patch).forEach(([key, value]) => {
          if (value === undefined) return
          if (
            value === null ||
            (Array.isArray(value) && value.length === 0) ||
            value === ""
          ) {
            copy.delete(key)
            return
          }
          if (Array.isArray(value)) {
            copy.delete(key)
            value.forEach(v => copy.append(key, v.toString()))
          } else {
            copy.set(key, value.toString())
          }
        })
        copy.sort()
        return copy
      })
      if (Object.keys(patch).some(k => (facets as string[]).includes(k))) {
        onFacetsChange?.()
      }
    },
    [setSearchParams, facets, onFacetsChange]
  )

  const toggleParamValue = useCallback(
    (name: string, rawValue: string, checked: boolean) => {
      const validator = validators[name as keyof ReqParams]
      if (!validator) {
        console.warn(`Unrecognized search param: ${name}`)
      }
      const validated = validator([rawValue])
      const value = Array.isArray(validated) ? validated[0] : validated
      if (value === undefined || value === null) return
      setSearchParams(current => {
        const copy = new URLSearchParams(current)
        const currentValues = copy.getAll(name)
        if (currentValues.includes(rawValue) === checked) return copy
        const newValues = checked ?
          [...currentValues, rawValue] :
          currentValues.filter(v => v !== rawValue)
        copy.delete(name)
        newValues.forEach(v => copy.append(name, v))
        copy.sort()
        return copy
      })
      if ((facets as string[]).includes(name)) {
        onFacetsChange?.()
      }
    },
    [setSearchParams, facets, onFacetsChange, validators]
  )

  const [currentText, setCurrentText] = useState(searchParams.get("q") ?? "")
  const setCurrentTextAndQuery = useCallback(
    (value: string) => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        if (value) {
          next.set("q", value)
        } else {
          next.delete("q")
        }
        next.sort()
        return next
      })
      setCurrentText(value)
    },
    [setSearchParams]
  )

  return {
    params,
    clearAllFacets,
    clearParam,
    patchParams,
    toggleParamValue,
    currentText,
    setCurrentText,
    setCurrentTextAndQuery
  }
}

const useResourceSearchParams = ({
  searchParams,
  setSearchParams,
  facets = [],
  onFacetsChange
}: UseValidatedSearchParamsProps<ResourceSearchRequest>) => {
  return useValidatedSearchParams<ResourceSearchRequest>({
    searchParams,
    setSearchParams,
    facets,
    validators: resourceSearchValidators,
    onFacetsChange
  })
}

const useContentFileSearchParams = ({
  searchParams,
  setSearchParams,
  facets = [],
  onFacetsChange
}: UseValidatedSearchParamsProps<ContentFileSearchRequest>) => {
  return useValidatedSearchParams<ContentFileSearchRequest>({
    searchParams,
    setSearchParams,
    facets,
    validators: contentSearchValidators,
    onFacetsChange
  })
}

type UseResourceSearchParamsProps =
  UseValidatedSearchParamsProps<ResourceSearchRequest>
type UseContentFileSearchParamsProps =
  UseValidatedSearchParamsProps<ContentFileSearchRequest>
type UseResourceSearchParamsResult =
  UseValidatedSearchParamsResult<ResourceSearchRequest>
type UseContentFileSearchParamsResult =
  UseValidatedSearchParamsResult<ContentFileSearchRequest>

export { useResourceSearchParams, useContentFileSearchParams }
export type {
  UseResourceSearchParamsProps,
  UseContentFileSearchParamsProps,
  UseResourceSearchParamsResult,
  UseContentFileSearchParamsResult
}
