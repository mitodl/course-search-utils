import { useCallback, useMemo, useRef, useState } from "react"
import { isEqual } from "lodash"
import { ENDPOINT_ALIAS, QUERY_TEXT_ALIAS, searchParamConfig } from "./configs"
import type { Endpoint, SearchParams, FacetName } from "./configs"

interface UseSearchQueryParamsResult {
  /**
   * Object containing parameters to be used in a search request. Calculated
   * based solely on UrlSearchParams.
   *
   * Note: The `params.endpoint` value determines what facets are available.
   */
  params: SearchParams
  /**
   * The current text to display in search input. This may be different from
   * `params.queryText` if the user has typed in the search input but not yet
   * submitted the search.
   */
  currentText: string
  /**
   * Modifies the UrlSearchParams, updating the portion of UrlSearchParams that
   * corresponds to specified facet.
   */
  setFacetActive: (
    /**
     * Facet name. E.g., "department", "level", etc.
     */
    name: string,
    /**
     * Facet value. E.g., "6", "8", etc.
     *
     * For boolean facets, this value is ignored and the facet state (true or
     * false) is determined solely by the `checked` parameter.
     */
    value: string,
    /**
     * Whether the facet should be active or inactive.
     */
    checked: boolean
  ) => void
  /**
   * Modifies the current UrlSearchParams to clear all facets according to the
   * current endpoint.
   */
  clearFacets: () => void
  /**
   * Sets the current text to display in the search input. Does NOT affect the
   * params object.
   */
  setCurrentText: (value: string) => void
  /**
   * Modifies the current UrlSearchParams; sets the current text to display in
   * the search input AND updates portion of UrlSearchParams corresponding to
   *  `params.queryText`.
   */
  setCurrentTextAndQuery: (value: string) => void
  /**
   * Modifies the current UrlSearchParams, updating the portion of UrlSearchParams
   * that corresponds to sort value. Valid values are determined by the current
   * endpoint.
   */
  setSort: (value: string | null) => void
  /**
   * Modifies the current UrlSearchParams, updating the portion of UrlSearchParams
   * that corresponds to the endpoint.
   */
  setEndpoint: (value: string) => void
}

interface UseSearchQueryParamsProps {
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
   * Default search endpoint.
   */
  defaultEndpoint?: Endpoint
}

const getEndpoint = (
  searchParams: URLSearchParams,
  defaultEndpoint: Endpoint
): Endpoint => {
  const endpoint = searchParams.get(ENDPOINT_ALIAS) ?? defaultEndpoint
  if (Object.keys(searchParamConfig).includes(endpoint)) {
    return endpoint as Endpoint
  }
  return defaultEndpoint
}

/**
 * Returns search API parameters derived from UrlSearchParameters, along with
 * functions to modify the UrlSearchParams.
 */
const useSearchQueryParams = ({
  searchParams,
  setSearchParams,
  defaultEndpoint = "resources"
}: UseSearchQueryParamsProps): UseSearchQueryParamsResult => {
  const endpoint = getEndpoint(searchParams, defaultEndpoint)
  const queryText = searchParams.get(QUERY_TEXT_ALIAS) ?? ""
  const [currentText, setCurrentText] = useState(queryText)

  const activeFacetsRef = useRef<
    UseSearchQueryParamsResult["params"]["activeFacets"]
  >({})
  const activeFacets = useMemo(() => {
    const active = Object.entries(searchParamConfig[endpoint].facets).reduce(
      (acc, [facet, { isValid, alias, isBoolean }]) => {
        const values = searchParams.getAll(alias)
        const valid = values.filter(v => isValid(v))
        if (valid.length === 0) return acc
        if (isBoolean) {
          acc[facet] = true
        } else {
          acc[facet] = valid
        }
        return acc
      },
      {} as Record<string, string[] | boolean>
    ) as UseSearchQueryParamsResult["params"]["activeFacets"]
    if (isEqual(activeFacetsRef.current, active)) {
      return activeFacetsRef.current
    }
    return active
  }, [endpoint, searchParams])

  const sort = searchParams.get(searchParamConfig[endpoint].sort.alias) ?? ""
  const params = useMemo(() => {
    const value: UseSearchQueryParamsResult["params"] = {
      endpoint,
      activeFacets,
      queryText
    }
    if (sort && searchParamConfig[endpoint].sort.isValid(sort)) {
      value.sort = sort as UseSearchQueryParamsResult["params"]["sort"]
    }
    return value
  }, [activeFacets, endpoint, queryText, sort])

  const setSort = useCallback(
    (value: string | null) => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        const { alias, isValid } = searchParamConfig[endpoint].sort
        if (value === null) {
          next.delete(alias)
        } else if (isValid(value)) {
          next.set(alias, value)
        } else {
          return prev
        }
        next.sort()
        return next
      })
    },
    [endpoint, setSearchParams]
  )
  const setCurrentTextAndQuery = useCallback(
    (value: string) => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        if (value) {
          next.set(QUERY_TEXT_ALIAS, value)
        } else {
          next.delete(QUERY_TEXT_ALIAS)
        }
        next.sort()
        return next
      })
      setCurrentText(value)
    },
    [setSearchParams]
  )
  const setFacetActive = useCallback(
    (facet: string, value: string, checked: boolean) => {
      const config = searchParamConfig[endpoint]["facets"][facet as FacetName]
      if (!config) return
      const { isValid, alias, isBoolean } = config
      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        const facetValues = next.getAll(alias)
        if (isBoolean) {
          if (checked) {
            next.set(alias, "true")
          } else {
            next.delete(alias)
          }
          next.sort()
          return next
        }
        if (!isValid(value)) return next
        const exists = facetValues.includes(value)
        if ((exists && checked) || (!exists && !checked)) return next
        if (checked) {
          next.append(alias, value)
        } else {
          next.delete(alias, value)
        }
        next.sort()
        return next
      })
    },
    [endpoint, setSearchParams]
  )

  const setEndpoint = useCallback(
    (value: string) => {
      if (!Object.keys(searchParamConfig).includes(value)) return
      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        if (value === defaultEndpoint) {
          next.delete(ENDPOINT_ALIAS)
        } else {
          next.set(ENDPOINT_ALIAS, value)
        }
        next.sort()
        return next
      })
    },
    [defaultEndpoint, setSearchParams]
  )

  const clearFacets = useCallback(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      Object.values(searchParamConfig[endpoint].facets).forEach(({ alias }) => {
        next.delete(alias)
      })
      next.sort()
      return next
    })
  }, [endpoint, setSearchParams])

  const result: UseSearchQueryParamsResult = {
    params,
    currentText,
    setFacetActive,
    setCurrentText,
    setCurrentTextAndQuery,
    setSort,
    setEndpoint,
    clearFacets
  }
  return result
}

export default useSearchQueryParams
export type { UseSearchQueryParamsResult, UseSearchQueryParamsProps }
