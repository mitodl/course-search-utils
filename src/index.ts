import React, {
  useState,
  useCallback,
  useEffect,
  MouseEvent,
  useMemo,
  useRef
} from "react"
import { unionWith, eqBy, prop, clone } from "ramda"
import _ from "lodash"
import { History as HHistory } from "history"

import {
  LearningResourceType,
  INITIAL_FACET_STATE,
  LR_TYPE_ALL
} from "./constants"
import {
  FacetsAndSort,
  Facets,
  deserializeSearchParams,
  deserializeSort,
  serializeSearchParams,
  SortParam,
  SearchParams
} from "./url_utils"
import { useEffectAfterMount } from "./hooks"

export * from "./constants"

export * from "./url_utils"

export { buildSearchQuery, SearchQueryParams } from "./search"

export interface Bucket {
  key: string
  doc_count: number // eslint-disable-line camelcase
}

export type Aggregation = {
  doc_count_error_upper_bound?: number // eslint-disable-line camelcase
  sum_other_doc_count?: number // eslint-disable-line camelcase
  buckets: Bucket[]
}

export type Aggregations = Map<string, Aggregation>

export type GetSearchPageSize = (ui: string | null) => number

export const mergeFacetResults = (...args: Aggregation[]): Aggregation => ({
  buckets: args
    .map(prop("buckets"))
    // @ts-ignore
    .reduce((buckets, acc) => unionWith(eqBy(prop("key")), buckets, acc))
})

/**
 * Accounts for a difference in the listener API for v4 and v5.
 * See https://github.com/remix-run/history/issues/811
 */
const history4or5Listen = (
  history: HHistory,
  listener: (loc: Location, action: string) => void
): (() => void) => {
  // @ts-ignore
  return history.listen((e1: any, e2: any) => {
    if (e2) {
      listener(e1, e2)
    } else {
      listener(e1.location, e1.action)
    }
  })
}

export const useFacetOptions = (
  aggregations: Aggregations,
  activeFacets: Facets
): ((group: string) => Aggregation | null) => {
  return useCallback(
    (group: string) => {
      const emptyFacet = { buckets: [] }
      const emptyActiveFacets = {
        buckets: (activeFacets[group] || []).map((facet: string) => ({
          key:       facet,
          doc_count: 0
        }))
      }

      if (!aggregations) {
        return null
      }

      return mergeFacetResults(
        aggregations.get(group) || emptyFacet,
        emptyActiveFacets
      )
    },
    [aggregations, activeFacets]
  )
}

type UseSearchInputsResult = {
  /**
   * Parameters to be used for a search query.
   *
   * Typically, these are the parameters of the previous search query. Thus,
   * `searchParams.text` may be different from `text` if the has typed new text
   * without submitting the search.
   */
  searchParams: SearchParams
  setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>
  /**
   * `text` displayed in the UI.
   *
   * May be different from `searchParams.text` if user has typed new text
   * without submitting the search.
   */
  text: string
  setText: (text: string) => void
  /**
   * Reset `searchParams` and `text`.
   */
  clearAllFilters: () => void
  /**
   * Toggle a single facet; also sets text -> searchParams.text.
   */
  toggleFacet: (name: string, value: string, isEnbaled: boolean) => void
  /**
   * Toggle multiple facets; also sets text -> searchParams.text.
   */
  toggleFacets: (facets: [string, string, boolean][]) => void
  /**
   * Event handler for toggling a single facet; also sets text -> searchParams.text.
   */
  onUpdateFacet: ({
    target
  }: {
    target: Pick<HTMLInputElement, "value" | "checked" | "name">
  }) => void
  /**
   * Input handler for updating `text` (des NOT update `searchParams.text`).
   */
  updateText: (event: { target: { value: string } }) => void
  /**
   * Event handler for clearing `text`; also clears searchParams.text.
   */
  clearText: () => void
  /**
   * Event handler for updating `searchParams.sort`; also sets text -> searchParams.text.
   */
  updateSort: (event: { target: { value: string } }) => void
  /**
   * Updates `searchParams.sort`; also sets text -> searchParams.text.
   */
  updateUI: (newUI: string | null) => void
  /**
   * Set `searchParams.text` to the current value of `text`.
   */
  submitText: () => void
}

/**
 * Provides state and event handlers for learning resources search UI; state
 * includes data for facets, query text, sort order, ui variant (e.g.,
 * 'compact').
 *
 * Note that there are two different state values for search text, `text` and
 * `searchParams.text`. In the typical setup:
 *  - `text` represents the text currently displayed in the UI and updates
 *    frequently (e.g., on every keypress).
 *  - `searchParams.text` represents the text used for the currently displayed
 *     search results and updates less often (e.g., when a user presses "submit"
 *     or on debounced keypresses).
 *
 * The provided event handlers for updating other search parameters (sort, ui,
 * facets) sync `text` -> `searchParams.text`.
 */
export const useSearchInputs = (history: HHistory): UseSearchInputsResult => {
  const [searchParamsInternal, setSearchParams] = useState<SearchParams>(() =>
    deserializeSearchParams(history.location)
  )

  const searchParams = useMemo(() => {
    return searchParamsInternal
    // This is intentional: let's maintain referential equality when
    // serialization is the same.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializeSearchParams(searchParamsInternal)])

  /**
   * Store text in state + ref. State for re-renders, and ref for render-stable
   * callbacks.
   */
  const textRef = useRef(searchParamsInternal.text)
  const [text, setTextState] = useState(searchParamsInternal.text)
  const setText = useCallback((val: string) => {
    setTextState(val)
    textRef.current = val
  }, [])

  const clearAllFilters = useCallback(() => {
    setSearchParams({
      text:         "",
      sort:         null,
      ui:           null,
      activeFacets: INITIAL_FACET_STATE
    })
    setText("")
  }, [setText])

  const toggleFacet: UseSearchInputsResult["toggleFacet"] = useCallback(
    (name, value, isEnabled) => {
      setSearchParams(current => {
        const { activeFacets, sort, ui } = current
        const newFacets = clone(activeFacets)

        if (isEnabled) {
          newFacets[name] = _.union(newFacets[name] || [], [value])
        } else {
          newFacets[name] = _.without(newFacets[name] || [], value)
        }
        return {
          ...current,
          activeFacets: newFacets,
          sort,
          ui,
          text:         textRef.current
        }
      })
    },
    []
  )

  const toggleFacets: UseSearchInputsResult["toggleFacets"] = useCallback(
    facets => {
      setSearchParams(current => {
        const { activeFacets, sort, ui } = current
        const newFacets = clone(activeFacets)

        facets.forEach(([name, value, isEnabled]) => {
          if (isEnabled) {
            newFacets[name] = _.union(newFacets[name] || [], [value])
          } else {
            newFacets[name] = _.without(newFacets[name] || [], value)
          }
        })
        return {
          ...current,
          activeFacets: newFacets,
          sort,
          ui,
          text:         textRef.current
        }
      })
    },
    []
  )

  const onUpdateFacet: UseSearchInputsResult["onUpdateFacet"] = useCallback(
    e => toggleFacet(e.target.name, e.target.value, e.target.checked),
    [toggleFacet]
  )

  const updateText: UseSearchInputsResult["updateText"] = useCallback(
    event => {
      const text = event ? event.target.value : ""
      setText(text)
    },
    [setText]
  )

  const updateSort: UseSearchInputsResult["updateSort"] = useCallback(
    (event): void => {
      const param = event ? (event.target as HTMLSelectElement).value : ""
      const newSort = deserializeSort(param)
      setSearchParams(current => ({
        ...current,
        sort: newSort,
        text: textRef.current
      }))
    },
    []
  )

  const updateUI = useCallback((newUI: string | null): void => {
    setSearchParams(current => ({
      ...current,
      ui:   newUI,
      text: textRef.current
    }))
  }, [])

  const clearText = useCallback(() => {
    setText("")
    setSearchParams(current => ({ ...current, text: "" }))
  }, [setText, setSearchParams])

  const submitText = useCallback(() => {
    setSearchParams(current => ({
      ...current,
      text: textRef.current
    }))
  }, [])

  return {
    searchParams,
    setSearchParams,
    text,
    setText,
    clearAllFilters,
    toggleFacet,
    toggleFacets,
    onUpdateFacet,
    updateText,
    updateSort,
    clearText,
    updateUI,
    submitText
  }
}

const setLocation = (history: HHistory, searchParams: SearchParams) => {
  const currentSearch = serializeSearchParams(
    deserializeSearchParams(history.location)
  )
  const { activeFacets, sort, ui, text } = searchParams
  const newSearch = serializeSearchParams({
    text,
    activeFacets,
    sort,
    ui
  })
  if (currentSearch !== newSearch) {
    const prefix = newSearch ? "?" : ""
    history.push({
      search: `${prefix}${newSearch}`
    })
  }
}

/**
 * Sync changes to URL search parameters with `searchParams`, and vice versa.
 *
 * Pushes a new entry to the history stack every time the URL would change.
 */
export const useSyncUrlAndSearch = (
  history: HHistory,
  {
    searchParams,
    setSearchParams,
    setText
  }: Pick<UseSearchInputsResult, "searchParams" | "setSearchParams" | "setText">
) => {
  // sync URL to search
  useEffect(() => {
    const unlisten = history4or5Listen(history, location => {
      const { activeFacets, sort, ui, text } = deserializeSearchParams(location)
      setSearchParams({ activeFacets, sort, ui, text })
      setText(text)
    })
    return unlisten
  }, [history, setSearchParams, setText])

  useEffect(() => {
    setLocation(history, searchParams)
  }, [history, searchParams])
}

interface PreventableEvent {
  preventDefault?: () => void
  type?: string
}
interface CourseSearchResult {
  facetOptions: (group: string) => Aggregation | null
  clearAllFilters: UseSearchInputsResult["clearAllFilters"]
  toggleFacet: UseSearchInputsResult["toggleFacet"]
  toggleFacets: UseSearchInputsResult["toggleFacets"]
  onUpdateFacets: UseSearchInputsResult["onUpdateFacet"]
  updateText: UseSearchInputsResult["updateText"]
  clearText: React.MouseEventHandler
  updateSort: UseSearchInputsResult["updateSort"]
  acceptSuggestion: (suggestion: string) => void
  loadMore: () => void
  incremental: boolean
  text: string
  sort: SortParam | null
  activeFacets: Facets
  /**
   * Callback that handles search submission. Pass this to your search input
   * submission event target, e.g., `<form onSubmit={onSubmit} />` or
   * `<button onClick={onSubmit} />`.
   *
   * The event target does not need to emit submit events, but if it does, the
   * default form action will be prevented.
   */
  onSubmit: (e: PreventableEvent) => void
  from: number 
  searchAfter: Array<number> | null
  updateUI: (newUI: string | null) => void
  ui: string | null
}

export const useCourseSearch = (
  runSearch: (
    text: string,
    searchFacets: Facets,
    nextFrom: number,
    sort?: SortParam | null,
    ui?: string | null,
    searchAfter?: Array<number> | null
  ) => Promise<void>,
  clearSearch: () => void,
  aggregations: Aggregations,
  loaded: boolean,
  searchPageSize: number | GetSearchPageSize,
  history: HHistory
): CourseSearchResult => {
  const [incremental, setIncremental] = useState(false)
  const [from, setFrom] = useState(0)
  const [searchAfter, setSearchAfter] = useState(null)

  const seachUI = useSearchInputs(history)
  const {
    searchParams,
    setSearchParams,
    text,
    setText,
    clearAllFilters,
    toggleFacet,
    toggleFacets,
    onUpdateFacet: onUpdateFacets,
    updateText,
    updateSort,
    updateUI
  } = seachUI
  const { activeFacets, sort, ui } = searchParams
  const activeFacetsAndSort = useMemo(() => ({ activeFacets, sort, ui }), [
    activeFacets,
    sort,
    ui
  ])
  const facetOptions = useFacetOptions(aggregations, activeFacets)

  const internalRunSearch = useCallback(
    async (
      text: string,
      activeFacetsAndSort: FacetsAndSort,
      incremental = false
    ) => {
      const { activeFacets, sort, ui } = activeFacetsAndSort

      const currentPageSize =
        typeof searchPageSize === "number" ? searchPageSize : searchPageSize(ui)

      let nextFrom = from + currentPageSize

      if (!incremental) {
        clearSearch()
        nextFrom = 0
      } 

      setFrom(nextFrom)
      setIncremental(incremental)

      const searchFacets = clone(activeFacets)

      if (searchFacets.type !== undefined && searchFacets.type.length > 0) {
        if (searchFacets.type.includes(LearningResourceType.Podcast)) {
          searchFacets.type.push(LearningResourceType.PodcastEpisode)
        }

        if (searchFacets.type.includes(LearningResourceType.Userlist)) {
          searchFacets.type.push(LearningResourceType.LearningPath)
        }
      } else {
        searchFacets.type = LR_TYPE_ALL
      }

      await runSearch(text, searchFacets, nextFrom, sort, ui, searchAfter)

      setLocation(history, { text, activeFacets, sort, ui })
    },
    [
      from,
      setFrom,
      searchAfter,
      setSearchAfter,
      setIncremental,
      clearSearch,
      runSearch,
      searchPageSize,
      history
    ]
  )

  const initSearch = useCallback(
    (location: { search: string }) => {
      const { text, activeFacets, sort, ui } = deserializeSearchParams(location)
      clearSearch()
      setText(text)
      setSearchParams(current => ({ ...current, activeFacets, sort, ui }))
    },
    [clearSearch, setText, setSearchParams]
  )

  const clearText = useCallback(
    (event: MouseEvent) => {
      event.preventDefault()
      setText("")
      internalRunSearch("", activeFacetsAndSort)
    },
    [activeFacetsAndSort, setText, internalRunSearch]
  )

  const acceptSuggestion = useCallback(
    (suggestion: string) => {
      setText(suggestion)
      internalRunSearch(suggestion, activeFacetsAndSort)
    },
    [setText, activeFacetsAndSort, internalRunSearch]
  )

  // this is our 'on startup' useEffect call
  useEffect(() => {
    initSearch(history.location)

    // dependencies intentionally left blank here, because this effect
    // needs to run only once - it's just to initialize the search state
    // based on the value of the URL (if any)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // We push browser state into the history when a piece of the URL changes. However
    // pressing the back button will update the browser stack but the UI does not respond by default.
    // So we have to trigger this change explicitly.
    const unlisten = history4or5Listen(history, (location, action) => {
      if (action === "POP") {
        // back button pressed
        // @ts-ignore
        initSearch(location)
      }
    })

    return unlisten
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadMore = useCallback(() => {
    if (!loaded) {
      // this function will be triggered repeatedly by <InfiniteScroll />, filter it to just once at a time
      return
    }

    internalRunSearch(text, activeFacetsAndSort, true)
  }, [internalRunSearch, loaded, text, activeFacetsAndSort])

  // this effect here basically listens to parts of the search UI which should cause an immediate rerun of
  // the search whenever they change. we always want these changes to take
  // effect immediately, so we need to either do this or call runSearch from
  // our facet-related callbacks. this approach lets us avoid having the
  // facet-related callbacks (toggleFacet, etc) be dependent on then value of
  // the runSearch function, which leads to too much needless churn in the
  // facet callbacks and then causes excessive re-rendering of the facet UI
  useEffectAfterMount(() => {
    internalRunSearch(text, activeFacetsAndSort)
  }, [activeFacetsAndSort])

  const onSubmit: CourseSearchResult["onSubmit"] = useCallback(
    e => {
      if (e.type === "submit") {
        e.preventDefault?.()
      }

      internalRunSearch(text, activeFacetsAndSort)
    },
    [internalRunSearch, text, activeFacetsAndSort]
  )

  return {
    facetOptions,
    clearAllFilters,
    toggleFacet,
    toggleFacets,
    onUpdateFacets,
    updateText,
    clearText,
    updateSort,
    acceptSuggestion,
    loadMore,
    incremental,
    text,
    sort,
    activeFacets,
    onSubmit,
    from,
    updateUI,
    ui,
    searchAfter
  }
}
